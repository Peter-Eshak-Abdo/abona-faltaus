import torch
from datasets import load_dataset
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, DataCollatorForSeq2Seq
from peft import LoraConfig, get_peft_model
from transformers import Trainer

device = "cuda" if torch.cuda.is_available() else "cpu"
model_id = "Qwen/Qwen2.5-0.5B-Instruct"

tokenizer = AutoTokenizer.from_pretrained(model_id)
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

model = AutoModelForCausalLM.from_pretrained(
    model_id,
    dtype=torch.float32 if device == "cpu" else torch.float16,
)

peft_config = LoraConfig(
    r=16,
    lora_alpha=16,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)

model = get_peft_model(model, peft_config)

prompt_template = """عليك الإجابة بناءً على النصوص الطقسية القبطية الأرثوذكسية.

### التصنيف:
{}

### النص:
{}"""

def formatting_prompts_func(examples):
    instructions = examples["instruction"]
    outputs = examples["output"]
    texts = []
    for instruction, output in zip(instructions, outputs):
        text = prompt_template.format(instruction, output) + tokenizer.eos_token
        texts.append(text)
    
    tokenized = tokenizer(
        texts,
        truncation=True,
        max_length=512,
        padding=False
    )
    tokenized["labels"] = tokenized["input_ids"].copy()
    return tokenized

dataset = load_dataset("json", data_files="coptic_liturgy_dataset.json", split="train")
dataset = dataset.map(formatting_prompts_func, batched=True, remove_columns=dataset.column_names)

training_args = TrainingArguments(
    output_dir="outputs",
    per_device_train_batch_size=1,
    gradient_accumulation_steps=4,
    warmup_steps=5,
    max_steps=60,
    learning_rate=2e-4,
    logging_steps=1,
    use_cpu=(device == "cpu"),
    seed=3407,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset,
    data_collator=DataCollatorForSeq2Seq(tokenizer, pad_to_multiple_of=8, return_tensors="pt", padding=True),
)

trainer.train()

model.save_pretrained("coptic_liturgy_lora_model")
tokenizer.save_pretrained("coptic_liturgy_lora_model")
