from fastapi import APIRouter, HTTPException, status, Depends, Body
from sqlmodel import SQLModel
from sqlmodel import select, Session
from models import UserInput, Users, Notes, CreateNote, UpdateNote, Folder, CreateFolder
from database import get_session
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from jwt_hashing import get_current_user, hash_password, check_hashed_password
from datetime import datetime

router = APIRouter()

@router.post('/create_note')
def create_note(
    note : CreateNote,
    current_user : Users = Depends(get_current_user(required_role="user")),
    session : Session = Depends(get_session)
):
    new_note = Notes(
        title = note.title,
        content = note.content,
        user_id = current_user.id,
        folder_id= note.folder,
        created_at = datetime.utcnow()
        
    )
    session.add(new_note)
    session.commit()
    session.refresh(new_note)
    return {"message" : "Note created"}

@router.get('/get_notes')
def get_notes(
        current_user : Users = Depends(get_current_user(required_role="user")),
        session : Session = Depends(get_session)
):

    get = session.exec(select(Notes).where(Notes.user_id == current_user.id)).all()

    return get or []    

@router.get('/get_note/{note_id}')
def get_notes(
    note_id:int,
        current_user : Users = Depends(get_current_user(required_role="user")),
        session : Session = Depends(get_session)
):
    get = session.get(Notes, note_id)
    return get
  
@router.put('/update_note/{note_id}')
def update_note(
    note_id : int,
    note : UpdateNote,
    current_user : Users = Depends(get_current_user(required_role="user")),
    session : Session = Depends(get_session)
):
    notes = session.get(Notes, note_id)
    if not notes or notes.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    
    update_dict = note.dict(exclude_unset=True)

    for key, value in update_dict.items():
        if value not in (None, ""): 
            setattr(notes, key, value)
    
    session.add(notes)
    session.commit()
    
    return {"message" : "Note updated"}

@router.delete('/delete_note/{note_id}')
def delete_note(note_id : int,
            current_user : Users = Depends(get_current_user(required_role="user")),
            session:Session = Depends(get_session)):
    note = session.exec(select(Notes).where( Notes.id == note_id)).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    
    session.delete(note)
    session.commit()
    return {"message" : "Note deleted"}


@router.post('/create_folder')
def create_folder(create : CreateFolder,
                  session :Session = Depends(get_session),
                  current_user : Users = Depends(get_current_user(required_role="user"))):


    new_folder = Folder(
        name = create.name,
        parent_folder_id = create.parent_folder_id,
        created_at = datetime.utcnow(),
    )
    
    session.add(new_folder)
    session.commit()
    session.refresh(new_folder)
    
    return {"message" : "Folder created"}


@router.post('/create_subfolder')
def create_subfolder(create : CreateFolder,
                  session :Session = Depends(get_session),
                  current_user : Users = Depends(get_current_user(required_role="user"))):

    check_folder = session.get(Folder, create.parent_folder_id)
    if not check_folder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent folder not found")
    
    new_folder = Folder(
        name = create.name,
        parent_folder_id = create.parent_folder_id,
        created_at = datetime.utcnow(),
    )
    
    session.add(new_folder)
    session.commit()
    session.refresh(new_folder)
    return {"message" : "Subfolder created"}

@router.get('/get_folder')
def get_folder(folder_id : int = Body(...),
               session : Session = Depends(get_session),
               current_user : Users = Depends(get_current_user(required_role="user"))):
    
    folder = session.get(Folder, folder_id)
    if not folder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")
    return folder


@router.get('/all_folders')
def all_folders(session : Session = Depends(get_session),
                current_user : Users = Depends(get_current_user(required_role="user"))):
    folders = session.exec(select(Folder)).all()
    return folders


@router.delete('/delete_folder')
def delete_folder(folder_id : int = Body(...),
                  session : Session = Depends(get_session),
                current_user : Users = Depends(get_current_user(required_role="user"))):
    folder = session.get(Folder, folder_id)
    if not folder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")
    folder.delete(folder)
    session.commit()
    return {"message" : "Folder deleted"}
    
"""
# For building folder path
def build_folder_path(session, folder_id):
    path = []
    current_folder = session.get(Folder, folder_id)
    while current_folder:
        path.append(current_folder.name)
        current = current_folder.parent_folder_id
    
    return "/" + "/".join(reversed(path))
    """