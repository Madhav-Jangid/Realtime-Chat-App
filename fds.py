import qrcode
def url_to_qr(url, file_name):
    qr = qrcode.QRCode(
        version=5,  # Controls the size of the QR Code
        error_correction=qrcode.constants.ERROR_CORRECT_L, 
        box_size=10,  # Controls how many pixels each “box” of the QR code is
        border=1,  # Controls how many boxes thick the border should be
    )
    
    # Add data to the instance
    qr.add_data(url)
    qr.make(fit=True)
    
    # Create an image from the QR Code instance
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save the image to a file
    img.save(file_name)
    print(f"QR code for {url} has been saved as {file_name}")

# Example usage
url = "https://forms.gle/DQPDEr9H1whJem3w5"
file_name = "qrcode.png"
url_to_qr(url, file_name)
