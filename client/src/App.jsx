import React from 'react'
import TecTacToe from './games/TicTacToe/TicTacToe'
import Heading from './components/Heading';
import "./App.css"

export default function App() {
  return (
    <>
      <Heading text="Tic-Tac-Toe" />
      <TecTacToe />
    </>
  );
}
