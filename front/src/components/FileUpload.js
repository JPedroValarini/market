import React, { useState } from "react";
import "./FileUpload.css";

const FileUpload = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const onFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const processFile = async () => {
    if (selectedFile) {
      try {
        const timestamp = new Date().toISOString().replace(/[-:.]/g, "_");
        const fileName = `${timestamp}_${selectedFile.name}`;

        const formData = new FormData();
        formData.append("file", selectedFile, fileName);

        const uploadResponse = await fetch("http://localhost:3001/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          console.log("Arquivo enviado e salvo com sucesso.");

          await fetch("http://localhost:3001/process-file", {
            method: "POST",
          });

          console.log("Arquivo processado com sucesso.");
          onUpload(selectedFile);
        } else {
          console.error("Erro ao enviar o arquivo.");
        }
      } catch (error) {
        console.error("Erro ao enviar ou processar o arquivo:", error);
      }
    }
  };

  return (
    <div>
      <input type="file" onChange={onFileChange} />
      {selectedFile && (
        <button onClick={processFile}>Enviar e Processar Arquivo</button>
      )}
    </div>
  );
};

export default FileUpload;
