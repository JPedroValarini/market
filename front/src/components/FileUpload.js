import React, { useState } from "react";
import "./FileUpload.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
          await fetch("http://localhost:3001/process-file", {
            method: "POST",
          });

          toast.success("Arquivo processado com sucesso.");
          onUpload(selectedFile);

          setTimeout(() => {
            window.location.reload();
          }, 1000);

        } else {
          toast.error("Erro ao enviar o arquivo.");
        }
      } catch (error) {
        toast.error("Erro ao enviar ou processar o arquivo: " + error.message);
      }
    } else {
      toast.warn("Nenhum arquivo selecionado.");
    }
  };

  return (
    <div>
      <input type="file" onChange={onFileChange} />
      {selectedFile && (
        <div>
          <button onClick={processFile}>Enviar e Processar Arquivo</button>
          <ToastContainer />
        </div>
      )}
    </div>
  );
};

export default FileUpload;
