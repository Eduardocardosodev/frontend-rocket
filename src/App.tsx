import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import { FaRocket } from 'react-icons/fa';
import './App.css';
import { Alert } from '@mui/material';

interface Position {
  x?: number;
  y?: number;
  direction: string;
}

interface Rocket {
  id: string;
  name: string;
  size: number;
}

const App: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [size, setSize] = useState<number>(1); // Tamanho padrão do foguete ao criar
  const [commands, setCommands] = useState<string>(''); // Comandos para logs
  const [initialPosition, setInitialPosition] = useState<Position>({
    x: 0,
    y: 0,
    direction: 'N',
  });
  const [position, setPosition] = useState<Position | null>(null);
  const [rocketExists, setRocketExists] = useState<boolean>(false);
  const [rocketId, setRocketId] = useState<string | null>(null);

  useEffect(() => {
    const checkRocketExists = async () => {
      try {
        const res = await axios.get(
          'https://backend-rocket-1.onrender.com/rocket/rocket-status'
        );

        console.log('res roicker exists', res);
        if (res.data.exists) {
          setRocketExists(true);
          await fetchRocket();
        } else {
          setRocketExists(false);
          setPosition(null);
        }
      } catch (error) {
        console.error('Erro ao verificar o status do foguete: ', error);
      }
    };

    checkRocketExists();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const createRocket = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post<Rocket>(
        'https://backend-rocket-1.onrender.com/rocket',
        {
          name,
          size,
        }
      );
      console.log(res);
      setRocketId(res.data.id);
      setRocketExists(true);
      setError(null);
      setPosition({ x: 0, y: 0, direction: 'N' }); // Inicializa a posição do foguete
    } catch (error: any) {
      console.error('Erro ao criar rocket: ', error.response.data.message);
      setError(error.response.data.message);
    }
  };

  const sendCommands = async (e: FormEvent) => {
    e.preventDefault();
    console.log('Sending commands:', commands, initialPosition);
    try {
      if (rocketId) {
        const res = await axios.post<Position>(
          'https://backend-rocket-1.onrender.com/rocket/commands',
          {
            commands,
            initialPosition,
          }
        );
        console.log('Response from server:', res.data);

        if (res.data.x === 4 && res.data.y === 4) {
          setRocketExists(false);
          setPosition(null);
          setRocketId(null);
          setName('');
          setInitialPosition({ x: 0, y: 0, direction: 'N' });
          setCommands('');
        } else {
          setPosition(res.data);
        }
        setError(null);
      }
    } catch (error) {
      console.error('Erro ao enviar comandos: ', error);
      setError('Erro ao enviar comandos.');
      setRocketExists(false);
      setPosition(null);
      setRocketId(null);
    }
  };

  const fetchRocket = async () => {
    try {
      const res = await axios.get<Rocket>(
        `https://backend-rocket-1.onrender.com/rocket/`
      );
      console.log('res', res);
      if (res.data) {
        setPosition({ x: 0, y: 0, direction: 'N' });
      } else {
        setRocketExists(false);
        setPosition(null);
        setRocketId(null);
      }
    } catch (error) {
      console.error('Erro ao buscar o foguete: ', error);
      setError('Erro ao buscar o foguete.');
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSize(Number(e.target.value));
  };

  const handleCommandsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCommands(e.target.value);
  };

  const handleInitialPositionChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInitialPosition((prevState) => ({
      ...prevState,
      [name]: name === 'direction' ? value : Number(value),
    }));
  };

  const getRotation = (direction: string) => {
    switch (direction) {
      case 'N':
        return 'rotate(0deg)';
      case 'E':
        return 'rotate(90deg)';
      case 'S':
        return 'rotate(180deg)';
      case 'W':
        return 'rotate(270deg)';
      default:
        return 'rotate(0deg)';
    }
  };

  return (
    <div className="App">
      <h1>Rocket Game</h1>
      {error && (
        <Alert
          severity="error"
          style={{ position: 'absolute', top: '20px', left: '20px' }}
        >
          {error}
        </Alert>
      )}
      {!rocketExists && (
        <form onSubmit={createRocket}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={handleNameChange}
            required
          />
          <input
            type="number"
            placeholder="Size"
            value={size}
            onChange={handleSizeChange}
            required
          />
          <button type="submit">Create Rocket</button>
        </form>
      )}
      {rocketExists && position && (
        <div>
          <div className="grid">
            {[...Array(5)].map((_, row) => (
              <div key={row} className="row">
                {[...Array(5)].map((_, col) => (
                  <div
                    key={col}
                    className={`cell ${
                      position.x === col && position.y === row ? 'rocket' : ''
                    }`}
                  >
                    {position.x === col && position.y === row && (
                      <FaRocket
                        style={{ transform: getRotation(position.direction) }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <form onSubmit={sendCommands}>
            <input
              type="number"
              name="x"
              placeholder="X"
              value={initialPosition.x}
              onChange={handleInitialPositionChange}
              required
            />
            <input
              type="number"
              name="y"
              placeholder="Y"
              value={initialPosition.y}
              onChange={handleInitialPositionChange}
              required
            />
            <input
              type="text"
              name="direction"
              placeholder="Direction"
              value={initialPosition.direction}
              onChange={handleInitialPositionChange}
              required
            />
            <input
              type="text"
              placeholder="Commands (L, R, M)"
              value={commands}
              onChange={handleCommandsChange}
            />
            <button type="submit">Send Commands</button>
          </form>
          {/* {position.x === 4 && position.y === 4 && (
            <button onClick={handleDeleteRocket}>Delete Rocket</button>
          )} */}
        </div>
      )}
    </div>
  );
};

export default App;
