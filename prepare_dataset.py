# import os
# import requests
# from PIL import Image
# from io import BytesIO

# DATASET_DIR = "./dataset/coptic_icons"
# os.makedirs(DATASET_DIR, exist_ok=True)

# # ضع هنا روابط الصور التي اخترتها (من 50 إلى 200 صورة كحد أقصى للـ LoRA)
# IMAGE_URLS = [
#     "https://example.com/image1.jpg",
#     "https://example.com/image2.jpg",
# ]

# BASE_CAPTION = "coptic_icon_style, a traditional 2D Coptic Orthodox icon, egg tempera, golden halo, authentic Coptic iconography"

# def process_and_save_dataset(urls, output_dir, caption):
#     for idx, url in enumerate(urls):
#         try:
#             response = requests.get(url, timeout=10)
#             response.raise_for_status()

#             img = Image.open(BytesIO(response.content)).convert("RGB")

#             # تغيير الحجم إلى 1024x1024
#             img = img.resize((1024, 1024), Image.Resampling.LANCZOS)

#             file_prefix = f"coptic_icon_{idx:03d}"
#             img_save_path = os.path.join(output_dir, f"{file_prefix}.png")
#             txt_save_path = os.path.join(output_dir, f"{file_prefix}.txt")

#             img.save(img_save_path, "PNG")

#             with open(txt_save_path, "w", encoding="utf-8") as f:
#                 f.write(caption)

#             print(f"Saved: {file_prefix}")

#         except Exception as e:
#             print(f"Error processing URL {url}: {e}")

# if __name__ == "__main__":
#     process_and_save_dataset(IMAGE_URLS, DATASET_DIR, BASE_CAPTION)
#     print("Dataset preparation complete. Please zip the folder: 'zip -r dataset.zip ./dataset/coptic_icons'")

import os
from PIL import Image

RAW_DIRS = ["./raw_images", "./raw_images1", "./raw_images2"]
OUTPUT_DATASET_DIR = "./dataset/all_styles"

os.makedirs(OUTPUT_DATASET_DIR, exist_ok=True)

def process_all_datasets():
    valid_exts = ('.jpg', '.jpeg', '.png', '.webp')
    counter = 0

    for raw_dir in RAW_DIRS:
        if not os.path.exists(raw_dir):
            continue

        images = [f for f in os.listdir(raw_dir) if f.lower().endswith(valid_exts)]
        print(f"Processing {len(images)} images from {raw_dir}...")

        for filename in images:
            try:
                img_path = os.path.join(raw_dir, filename)
                img = Image.open(img_path).convert("RGB")
                img = img.resize((1024, 1024), Image.Resampling.LANCZOS)

                file_prefix = f"img_{counter:05d}"

                # 1. تخصيص الوصف حسب نوع الصورة
                if "_LUMO_" in filename or "LUMO" in filename:
                    caption = "lumo_film_style, cinematic historical biblical drama, realistic 35mm film still, The LUMO Project, authentic first century biblical scene, natural lighting, dramatic film photography"
                elif "OIP (1)" in filename or "ابانوب" in filename or "abanoub" in filename.lower():
                    caption = "coptic_icon_style, traditional Coptic Orthodox icon of Saint Abanoub the Martyr, kneeling in prayer, white tunic with cross, golden halo, coptic script, Isaac Fanous neo-coptic iconography style"
                elif "_SP_" in filename or "SP" in filename:
                    caption = "sweet_publishing_style, classic bible story illustration, vintage watercolor comic storybook art, Jim Padgett style"
                else:
                    caption = "coptic_icon_style, traditional 2D Coptic Orthodox icon, Isaac Fanous neo-coptic style, egg tempera, golden halo, authentic Coptic iconography"

                # 2. حفظ الصورة وملف الوصف
                img.save(os.path.join(OUTPUT_DATASET_DIR, f"{file_prefix}.png"), "PNG")
                with open(os.path.join(OUTPUT_DATASET_DIR, f"{file_prefix}.txt"), "w", encoding="utf-8") as f:
                    f.write(caption)

                counter += 1
            except Exception as e:
                print(f"Error processing {filename}: {e}")
                continue

    print(f"\nDone! Processed total {counter} images into '{OUTPUT_DATASET_DIR}'")

if __name__ == "__main__":
    process_all_datasets()

