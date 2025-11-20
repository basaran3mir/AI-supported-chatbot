from PIL import Image

img = Image.open("static/images/logo.png")
img = img.convert("RGBA")

datas = img.getdata()

new_data = []
for item in datas:
    if item[0] > 50 and item[1] > 50 and item[2] > 50:
        new_data.append((255, 255, 255, 0))
    else:
        new_data.append(item)

img.putdata(new_data)
img.save("static/images/logo.png", "PNG")
print("Tamamlandı!")
