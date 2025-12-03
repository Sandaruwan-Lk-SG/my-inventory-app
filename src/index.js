import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // අපේ App.js Component එක Import කරනු ලබයි

// React 18+ සඳහා:
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* App Component එක render කිරීම */}
    <App /> 
  </React.StrictMode>
);

// සටහන:
// මෙම ගොනුව සහ public/index.html ගොනුව සාමාන්‍යයෙන්
// Create React App (CRA) Setup එකේදී ස්වයංක්‍රීයව නිර්මාණය වේ.
