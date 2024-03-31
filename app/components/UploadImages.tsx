"use client"
import { useState, useEffect, Key } from 'react';
import Image from 'next/image'

interface Props {
  params: {
    selectedFiles: any
    setSelectedFiles: any
  }
}

export default function UploadImages({ params }: Props) {
  const { selectedFiles, setSelectedFiles } = params 

  const handleFileChange = (event: { target: { files: any; }; }) => {
    setSelectedFiles([...selectedFiles, ...event.target.files]);
  };

  return (
    <div>
      <input type="file" multiple onChange={handleFileChange} accept='image/*, video/*'/>
      <div>
        <h3>Selected Files:</h3>
        <ul>
          {selectedFiles.map((file: Blob | MediaSource, index: any) => (
            <Image 
              key={index}
              width={100}
              height={100}
              src={URL.createObjectURL(file)}
              alt={`Selected file ${index + 1}`}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}