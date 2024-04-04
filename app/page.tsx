"use client"
import Image from "next/image";
import styles from "./page.module.css";
import SelectImages from "./components/SelectImages";
import DisplayImages from "./components/DisplayImages";
import LoadingSpinner from './components/LoadingSpinner';
import Message from './components/Message';
import { useState, useRef } from 'react'

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<any>([]);
  const [email, setEmail] = useState<any>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const imageRef = useRef();

  function validateForm() {
    const emailRegex = /^[\w-]+(\.[\w-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,})$/

    if (!email) {
      setMessage('Please enter your email')
      return false
    } else if (!emailRegex.test(email)) {
      setMessage('Email must follow proper email format')
      return false
    }

    if (!selectedFiles.length) {
      setMessage('Please select at least one file')
      return false
    } else if (selectedFiles.length > 50) {
      setMessage('Please select no more than 50 files at a time')
      return false
    }

    return true
  }

  function resetForm() {
    setSelectedFiles([])
    /* if (imageRef.current) { 
      imageRef.current.value = ""
    } */
  }

  const handleUpload = async (event: any) => {
    event.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)

    try {
      const formData = new FormData();
      selectedFiles.forEach((file: string | Blob) => {
        formData.append(`file`, file);
      });

      formData.append('email', email);

      // Send the files to the server

      const response = await fetch('./api/upload', {
        method: 'POST',
        body: formData
      });

      console.log('Files uploaded successfully:', await response.json());
      setMessage('Files uploaded successfully')
      
    } catch (error: any) {
      console.error('Error uploading files:', error);
      setMessage(error.message)
    } finally {
      setLoading(false)
      resetForm()
    }
  }
  
  return (
    <main className={styles.main}>
      { loading && <LoadingSpinner /> }
      { message && <Message params={{ textMessage: message }}/> }
      <h1>@Xodus media archiver</h1>
      <form action="" encType="multipart/form-data" onSubmit={(event) => handleUpload(event)} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="email">What is your email?</label>
          <input type="text" placeholder="Example123@gmail.com" onChange={(e) => setEmail(e.target.value)}/>
        </div>
        <hr />
        <div className={styles.formGroup}>
          <SelectImages params={{ selectedFiles, setSelectedFiles, imageRef }} />
        </div>
        <hr />
        <div className={styles.formGroup}>
          <DisplayImages params={{ selectedFiles, setSelectedFiles }} />
        </div>
        <hr />
        <button>Submit</button>
      </form>
    </main>
  );
}
