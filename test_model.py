import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

base_model_id = "Qwen/Qwen2.5-0.5B-Instruct"
lora_path = "coptic_liturgy_lora_model"

print("جاري تحميل النموذج وموزان التخصيص (LoRA Adapter)...")
tokenizer = AutoTokenizer.from_pretrained(base_model_id)
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

base_model = AutoModelForCausalLM.from_pretrained(
    base_model_id,
    dtype=torch.float32,
    low_cpu_mem_usage=False
)

model = PeftModel.from_pretrained(base_model, lora_path)
model.eval()

def generate_liturgy_response(instruction_text):
    prompt_template = f"""عليك الإجابة بناءً على النصوص الطقسية القبطية الأرثوذكسية.

### التصنيف:
{instruction_text}

### النص:
"""
    inputs = tokenizer(prompt_template, return_tensors="pt")
    with torch.no_grad():
        outputs = model.generate(
            input_ids=inputs["input_ids"],
            attention_mask=inputs.get("attention_mask"),
            max_new_tokens=100,
            temperature=0.7,
            top_p=0.9,
            repetition_penalty=1.1,
            pad_token_id=tokenizer.pad_token_id,
            eos_token_id=tokenizer.eos_token_id
        )
    result = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return result

if __name__ == "__main__":
    test_queries = [
        "صلاة الصلح القداس الباسيلي",
        "مرد الإنجيل سنوي",
        "أرباع الناقوس باكر"
    ]
    for q in test_queries:
        print(f"\n--- السؤال/الطلب: {q} ---")
        answer = generate_liturgy_response(q)
        print(answer)
