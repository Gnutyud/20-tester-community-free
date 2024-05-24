// import { uploadFileToFirebase } from "@/utils/uploadFileToFirebase";
import React, { useEffect, useRef, useState } from "react";
import { LiaEyeSlashSolid, LiaEyeSolid } from "react-icons/lia";

export const UploadImageInputDropzone = ({ label, setValue, ...others }: any) => {
  const dragdropRef = useRef<HTMLDivElement>(null);

  const handleUploadImage = async (imageFile: File) => {
    // upload file to server

    // const formData = new FormData();
    // formData.append("photo", imageFile);
    // const uploadResponse = await uploadServices.uploadImage(formData);
    // setUploadImgSrc(uploadResponse.url);
    // setValue(uploadResponse.url);
    // if (imageFile) {
    //   const reader = new FileReader();

    //   // Convert the image file to a string
    //   reader.readAsDataURL(imageFile);

    //   // FileReader will emit the load event when the data URL is ready
    //   // Access the string using result property inside the callback function
    //   reader.addEventListener("load", () => {
    //     // Get the data URL string: reader.result
    //     setValue((reader.result as string) || "");
    //   });
    // }
    //   const imageLink = await uploadFileToFirebase(imageFile);
    // Upload the image using the fetch and FormData APIs
    let formData = new FormData();
    // Assume "image" is the name of the form field the server expects
    formData.append("image", imageFile);
    formData.append("type", 'file');
    formData.append("name", imageFile.name);

    const response = await fetch("https://api.imgur.com/3/upload?client_id=546c25a59c58ad7", {
      method: "POST",
      body: formData,
      headers: {
        "content-type": "multipart/form-data",
        // Authorization: "Client-ID 546c25a59c58ad7",
      },
    });
    const imgRes = await response.json();
    if (imgRes && imgRes?.data?.link) {
      console.log(imgRes?.data?.link);
      setValue(imgRes.data.link);
    }
  };

  // handle drag events
  const handleDrag = function (e: any) {
    e.preventDefault();
    e.stopPropagation();
  };

  // triggers when file is dropped
  const handleDrop = function (e: any) {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const imageFile = e.dataTransfer.files[0];
      handleUploadImage(imageFile);
    }
  };

  useEffect(() => {
    dragdropRef?.current?.addEventListener("dragover", handleDrag);
    dragdropRef?.current?.addEventListener("drop", handleDrop);

    return () => {
      dragdropRef?.current?.removeEventListener("dragover", handleDrag);
      dragdropRef?.current?.removeEventListener("drop", handleDrop);
    };
  }, []);

  const onClickUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.currentTarget.files && e.currentTarget.files.length) {
        const imageFile = e.currentTarget.files[0];
        handleUploadImage(imageFile);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {label && <label className="block mb-2 text-sm font-medium text-gray-900 ">{label}</label>}
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 "
        >
          <div ref={dragdropRef} className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              aria-hidden="true"
              className="w-10 h-10 mb-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            <p className="mb-2 text-sm text-gray-500 pl-4 pr-4 text-center">
              <span className="font-semibold">Click to upload your evidence to prove that you installed app</span> or
              drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF or SVG</p>
          </div>

          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            accept="image/png, image/gif, image/jpeg, .svg"
            {...others}
            onChange={(e) => {
              onClickUploadImage(e);
            }}
          />
        </label>
      </div>
    </>
  );
};
