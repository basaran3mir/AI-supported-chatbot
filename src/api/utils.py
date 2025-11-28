from PIL import Image

def transparentBG(img_input_path, img_output_path):
    img = Image.open(img_input_path)
    img = img.convert("RGBA")

    datas = img.getdata()

    new_data = []
    for item in datas:
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(img_output_path, "PNG")
    print("Tamamlandı!")

def resizeImage(img_input_path, img_output_path, width, height):
    img = Image.open(img_input_path)
    img = img.resize((width, height), Image.LANCZOS)
    img.save(img_output_path)
    print("Resize işlemi tamamlandı!")

transparentBG("static/images/fullres-logo.png", "static/images/logo.png")
resizeImage("static/images/logo.png", "static/images/logo_120x120.png", 120, 120)