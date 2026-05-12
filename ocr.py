from paddleocr import PaddleOCR
import sys
import json

image_path = sys.argv[1]

# Initialize OCR
ocr = PaddleOCR(
    use_textline_orientation=True,
    lang='en'
)

# Run OCR
result = ocr.ocr(image_path)

texts = []

for line in result:
    if line:
        for item in line:
            try:
                text = item[1][0]
                texts.append(text)
            except:
                pass

output = {
    "text": "\n".join(texts)
}

print(json.dumps(output, ensure_ascii=False))

