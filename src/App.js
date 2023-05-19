
import './App.css';
import {Amplify, Auth, API} from 'aws-amplify'
import '@aws-amplify/ui-react/styles.css';
import { useAuthenticator, withAuthenticator } from '@aws-amplify/ui-react';
import awsconfig from './aws-exports';
import FileUpload from './FileUpload';


Amplify.configure(awsconfig);
Auth.configure(awsconfig);

function App() {



  
  const { signOut } = useAuthenticator()
  return (
    <div className="App">
     
      <header className="App-header">
        <FileUpload />
        <button onClick={() => signOut()}>Log Out</button>
      </header>
    </div>
  );
}

export default withAuthenticator(App);