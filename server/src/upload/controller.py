from fastapi import APIRouter, UploadFile, File
from src.encryption.crypto import encrypt_data

router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)


@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    data = await file.read()

    nonce, encrypted_data = encrypt_data(data)

    with open(file.filename + ".enc", "wb") as f:
        f.write(nonce)
        f.write(encrypted_data)

    return {
        "message": "File encrypted successfully",
        "filename": file.filename + ".enc",
        "encrypted_size": len(encrypted_data)
    }
@router.post("/decrypt")
async def decrypt_file(file: UploadFile = File(...)):
    data = await file.read()

    nonce = data[:12]
    encrypted_data = data[12:]

    from src.encryption.crypto import decrypt_data

    decrypted = decrypt_data(nonce, encrypted_data)

    return {
        "message": "File decrypted successfully",
        "content": decrypted.decode()
    }