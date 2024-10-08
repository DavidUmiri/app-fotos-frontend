import React, { useState } from 'react';
import axios from 'axios';

const BuscarImagenes = () => {
    const [query, setQuery] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [orientacion, setOrientacion] = useState('');
    const [color, setColor] = useState('');
    const [imagenes, setImagenes] = useState([]);

    const buscarImagenes = async (e) => {
        e.preventDefault();
        try {
            const respuesta = await axios.get(`http://localhost:5000/unsplash`, {
                params: {
                    query,
                    cantidad,
                    orientacion,
                    color,
                },
            });
            setImagenes(respuesta.data);
        } catch (error) {
            console.error("Error al buscar imágenes:", error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-10">
            <h1 className="text-2xl font-bold mb-5 text-center">Buscar imágenes</h1>
            <form onSubmit={buscarImagenes} className="space-y-4 mb-5">
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <label htmlFor="buscar" className="sm:w-1/4">Buscar imagen:</label>
                    <input
                        id="buscar"
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        required
                        className="w-full sm:w-3/4 p-3 border rounded"
                    />
                </div>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <label htmlFor="cantidad" className="sm:w-1/4">Cantidad de imágenes:</label>
                    <input
                        id="cantidad"
                        type="number"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                        min="1"
                        className="w-full sm:w-3/4 p-3 border rounded"
                    />
                </div>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <label htmlFor="orientacion" className="sm:w-1/4">Todas las orientaciones:</label>
                    <select
                        id="orientacion"
                        onChange={(e) => setOrientacion(e.target.value)}
                        className="w-full sm:w-3/4 p-3 border rounded"
                    >
                        <option value="landscape">Horizontal</option>
                        <option value="portrait">Vertical</option>
                        <option value="squarish">Cuadrado</option>
                    </select>
                </div>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <label htmlFor="color" className="sm:w-1/4">Indica el color:</label>
                    <select
                        id="color"
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full sm:w-3/4 p-3 border rounded"
                    >
                        <option value="black_and_white">Blanco y Negro</option>
                        <option value="black">Negro</option>
                        <option value="white">Blanco</option>
                        <option value="yellow">Amarillo</option>
                    </select>
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-3 rounded hover:bg-green-600 transition"
                >
                    Buscar
                </button>
            </form>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {imagenes.map((imagen) => (
                    <img
                        key={imagen.id}
                        src={imagen.urls.small}
                        alt={imagen.alt_description}
                        className="w-full h-auto rounded shadow-lg"
                    />
                ))}
            </div>
        </div>
    );


}

export default BuscarImagenes;