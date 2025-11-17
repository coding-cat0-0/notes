import { Component, OnInit, OnDestroy,ViewEncapsulation, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser, NgForOf, SlicePipe } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { response } from 'express';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-note',
  standalone: true,
  imports: [FormsModule,SlicePipe, HttpClientModule, MatSnackBarModule, NgForOf],
  templateUrl: './create-note.component.html',
  styleUrl: './create-note.component.css',
  encapsulation: ViewEncapsulation.None
})
export class CreateNoteComponent implements OnInit, OnDestroy {
title = '';
content = '';
folder = '';
editingId: number | null = null; 
data : any[] = [];
apiUrl = 'http://localhost:8000/create_note';
getapiUrl = 'http://localhost:8000/get_notes';


  constructor(

    private http:HttpClient, private snackBar:MatSnackBar,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
     if(typeof window !== 'undefined'){
    if (isPlatformBrowser(this.platformId)) {
      this.document.body.classList.add('hide-header');
      const backgroundLayer = this.document.getElementById('background-layer');
      if (backgroundLayer) {
        backgroundLayer.classList.add('blur-bg');
      }
    }
  }
    this.getNotes().subscribe({
      next : (res : any)=>{
        this.data = Array.isArray(res) ? res : [];
        console.log("Your notes :", res);
      }, error : (err)=>{
        this.data = []
        console.log(err.detail)
      }
    });
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.document.body.classList.remove('hide-header');
      const backgroundLayer = this.document.getElementById('background-layer');
      if (backgroundLayer) {
        backgroundLayer.classList.remove('blur-bg');
      }
    }
  }

  createNote(){
    if(!this.title && !this.content){
      return this.showPopup('Please fill in at least one field');
    }

    const noteData = {
      title : this.title || null,
      content : this.content || null,
      folder : this.folder || null,
    }
    this.http.post(this.apiUrl, noteData).subscribe({
      next : (response: any)=>{
          this.showPopup(response.message);
          this.title = '';
          this.content='';
          this.loadNotes();

      }, error:(error)=>{
        console.log('Error', error);
        this.showPopup(error.error.detail);
      }
    })
  }
  getNotes(){
    return this.http.get(this.getapiUrl);
  }

  deleteNote(note_id:number){
    const deleteurl = `http://localhost:8000/delete_note/${note_id}`;

    this.http.delete(deleteurl).subscribe({
      next : (res : any)=>{
        this.showPopup(res.message);
        this.loadNotes();
      }, error: (err) => {
      console.log(err);
    }
    })
  }

  getNote(note_id:number){
    const geturl = `http://localhost:8000/get_note/${note_id}`;

    this.http.get(geturl).subscribe({
      next : (res : any)=>{
        this.title = res.title;
        this.content = res.content;
        this.folder = res.folder;
        this.editingId = note_id;
        this.loadNotes();
      }, error: (err) => {
      console.log(err);
    }
    })
  }  

  updateNote(){
    if(!this.editingId)return;
    const updatedNote = {
    title: this.title,
    content: this.content,
    folder: this.folder
  };
  this.http.put(`http://localhost:8000/update_note/${this.editingId}`, updatedNote).subscribe({
    next:(res:any)=>{
      this.showPopup("Note updated");
      this.editingId = null;   
      this.loadNotes();        
      this.title = '';
      this.content = '';
    }
  })
  }

  saveNote() {
  this.editingId === null ? this.createNote(): this.updateNote();
}

  loadNotes(){
    this.getNotes().subscribe({
      next :(res:any)=>{
          this.data = Array.isArray(res) ? res : [];
      }
    })
  }
 clearNote(){
  this.title='';
  this.content='';
 }
  showPopup(message: string) {  
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: 'neon-snackbar'
    });
  }
}
