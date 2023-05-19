import React, { useState } from 'react';
import { Storage } from 'aws-amplify';
import { API } from '@aws-amplify/api';
import awsexports from './aws-exports'
import {Amplify, Auth} from 'aws-amplify'
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);
Auth.configure(awsconfig);

async function saveInput(inputText, inputFilePath) {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const token = user.signInUserSession.idToken.jwtToken;
  
      const requestData = {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "GET,PUT,OPTIONS",
            Authorization: token
        },
      };
  
      const apiName = awsexports.aws_cloud_logic_custom[0].name;
      
  
      const options = {
        body: {
          inputText,
          inputFilePath,
        },
        headers: requestData.headers,
      };
      console.log("Check")
      const data = await API.post(apiName, '/fileinfo', options);
      console.log(data)
      
      
      
      
    } catch (error) {
      console.error('Error saving input:', error);
    }
  }
  
  

function FileUpload() {
  const [file, setFile] = useState(null);
  const [inputText, setInputText] = useState('');
  var inputFilePath = 's3://filestorage122351-dev/private/us-east-1:58dc6076-3925-48e1-b542-deb793c64ef1/'

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleTextChange = (event) => {
    setInputText(event.target.value);
    
  };

  

  const handleUpload = async () => {
    try {
      const result = await Storage.put(file.name, file, {
        level: 'private' // set access level to private
      });
      console.log('File uploaded successfully: ', result);
      inputFilePath += file.name;
      saveInput(inputText,inputFilePath)

    } catch (error) {
      console.error('Error uploading file: ', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="w-full max-w-md p-4">
        <form>
          <div className="mb-4">
            <label htmlFor="inputText" className="block text-gray-700 text-sm font-bold mb-2">Text Input:</label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              value={inputText}
              placeholder="Enter text here"
              onChange={handleTextChange}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">File Input:</label>
            <input type="file" className="hidden" onChange={handleFileChange} />
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleUpload}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FileUpload;


