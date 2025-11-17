from datetime import datetime, date
from sqlmodel import SQLModel, Field, Relationship
from pydantic import field_validator 
import re
from typing import Optional, List


class UserInput(SQLModel):
    name : str
    email : str
    password : str
    @field_validator('email')
    def email_must_be_valid(cls, v):    
        if not re.search(r"\w+@(\w+\.)?\w+\.(com)$",v, re.IGNORECASE):
            raise ValueError("Invalid email format")
        else:
            return v
    @field_validator('password')    
    def password_must_be_strong(cls, p):
             if not re.search(r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%&*^_-])[A-Za-z\d!@#$%^&_*-]{8,}$",p):
                 raise ValueError("Invalid Password")
             else:
                    return p   
class CreateFolder(SQLModel):
    name : str
    parent_folder_id : Optional[int] = None


class Folder(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # For subfolders
    parent_folder_id: Optional[int] = Field(
        default=None,
        foreign_key="folder.id"
    )

    # Relationships
    parent: Optional["Folder"] = Relationship(
        back_populates="children",
        sa_relationship_kwargs={"remote_side": "Folder.id", "cascade": "all, delete"}
    )

    children: List["Folder"] = Relationship(
        back_populates="parent"
    )

    notes: List["Notes"] = Relationship(
        back_populates="folder",
        sa_relationship_kwargs={"cascade": "all, delete"}
    )


class Notes(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    user_id: int = Field(default=None, foreign_key="users.id")
    folder_id: Optional[int] = Field(default=None, foreign_key="folder.id")
    title: Optional[str] = Field(default=None)
    content: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    user: Optional["Users"] = Relationship(
        back_populates="notes"
    )

    folder: Optional["Folder"] = Relationship(
        back_populates="notes"
    )


class Users(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    email: str = Field(nullable=False)
    password: str = Field(nullable=False)
    role : str = Field(default="user", nullable=False)

    notes: List["Notes"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete"}
    )
      
class CreateNote(SQLModel):
      title : Optional[str] = Field(default = None, nullable = True)
      content : Optional[str] = Field(default = None, nullable = True)
      folder   : Optional[int] = Field(default = None, nullable = True)
      
      
class UpdateNote(SQLModel):
        title : Optional[str] = None
        content : Optional[str] = None
        folder_id : Optional[int] = None
        
