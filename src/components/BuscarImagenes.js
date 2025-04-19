import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BuscarImagenes = () => {
    const [query, setQuery] = useState('');
    const [cantidad, setCantidad] = useState(10);
    const [orientacion, setOrientacion] = useState('');
    const [color, setColor] = useState('');
    const [imagenes, setImagenes] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchPerformed, setSearchPerformed] = useState(false);

    // Función para obtener imágenes aleatorias al cargar la página
    useEffect(() => {
        const cargarImagenesIniciales = async () => {
            try {
                // Temas populares para búsqueda aleatoria inicial
                const temasAleatorios = [
                    'nature', 'architecture', 'travel', 
                    'technology', 'food', 'animals'
                ];
                const temaRandom = temasAleatorios[Math.floor(Math.random() * temasAleatorios.length)];
                
                const respuesta = await axios.get(`https://app-fotos-backend-production.up.railway.app/unsplash`, {
                    params: {
                        query: temaRandom,
                        cantidad: 8
                    },
                    timeout: 10000
                });
                
                setImagenes(respuesta.data);
            } catch (error) {
                console.error("Error al cargar imágenes iniciales:", error);
                setError("No se pudieron cargar las imágenes iniciales. Por favor intenta buscar algo.");
            } finally {
                setInitialLoading(false);
            }
        };

        cargarImagenesIniciales();
    }, []);

    const buscarImagenes = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSearchPerformed(true);
        
        try {
            const respuesta = await axios.get(`https://app-fotos-backend-production.up.railway.app/unsplash`, {
                params: {
                    query,
                    cantidad,
                    orientacion,
                    color,
                },
                timeout: 10000
            });
            setImagenes(respuesta.data);
            if (respuesta.data.length === 0) {
                setError("No se encontraron imágenes para esta búsqueda");
            }
        } catch (error) {
            console.error("Error al buscar imágenes:", error);
            setError(error.response?.data?.mensaje || "Error al conectar con el servidor. Intente de nuevo.");
            setImagenes([]);
        } finally {
            setLoading(false);
        }
    };

    const abrirModal = (imagen) => {
        setSelectedImage(imagen);
        setModalOpen(true);
        // Prevenir scroll cuando el modal está abierto
        document.body.style.overflow = 'hidden';
    }

    const cerrarModal = () => {
        setModalOpen(false);
        setSelectedImage('');
        // Restaurar scroll cuando se cierra el modal
        document.body.style.overflow = 'auto';
    }

    const manejarClickFuera = (e) => {
        if (e.target === e.currentTarget) {
            cerrarModal();
        }
    }

    // Manejador de tecla Escape para cerrar el modal
    useEffect(() => {
        const handleEscKey = (e) => {
            if (e.key === 'Escape' && modalOpen) {
                cerrarModal();
            }
        };

        window.addEventListener('keydown', handleEscKey);
        return () => window.removeEventListener('keydown', handleEscKey);
    }, [modalOpen]);

    // Función para distribuir imágenes en columnas para efecto masonry
    const distribuirImagenesEnColumnas = (imagenes, numColumnas = 4) => {
        // Crear columnas vacías
        const columnas = Array.from({ length: numColumnas }, () => []);
        
        // Distribuir imágenes entre columnas
        imagenes.forEach((imagen, index) => {
            const columnaIndex = index % numColumnas;
            columnas[columnaIndex].push(imagen);
        });
        
        return columnas;
    };

    // Obtener columnas según el tamaño de pantalla
    const getColumnCount = () => {
        // En un componente real, esto se manejaría con un hook de media query o resize
        if (window.innerWidth >= 1280) return 4; // xl
        if (window.innerWidth >= 768) return 3;  // md
        if (window.innerWidth >= 640) return 2;  // sm
        return 1; // móvil
    };

    // Distribuir imágenes en columnas
    const columnasDeImagenes = distribuirImagenesEnColumnas(imagenes, getColumnCount());

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-16">
            {/* Header con diseño mejorado */}
            <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <h1 className="text-3xl font-bold tracking-tight flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Galería de Imágenes
                        </h1>
                        <p className="text-blue-100 mt-2 md:mt-0">Encuentra imágenes profesionales para tus proyectos</p>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Panel de búsqueda */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800">Buscar imágenes</h2>
                    </div>
                    
                    <form onSubmit={buscarImagenes} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div className="space-y-1">
                                <label htmlFor="buscar" className="block text-sm font-medium text-gray-700">
                                    Palabra clave
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        id="buscar"
                                        type="text"
                                        placeholder="Ej: paisaje, ciudad, tecnología..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        required
                                        className="pl-10 w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700">
                                    Cantidad
                                </label>
                                <input
                                    id="cantidad"
                                    type="number"
                                    value={cantidad}
                                    onChange={(e) => setCantidad(e.target.value)}
                                    min="1"
                                    max="30"
                                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="orientacion" className="block text-sm font-medium text-gray-700">
                                    Orientación
                                </label>
                                <select
                                    id="orientacion"
                                    value={orientacion}
                                    onChange={(e) => setOrientacion(e.target.value)}
                                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                    disabled={loading}
                                >
                                    <option value="">Todas las orientaciones</option>
                                    <option value="landscape">Horizontal</option>
                                    <option value="portrait">Vertical</option>
                                    <option value="squarish">Cuadrado</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                                    Color
                                </label>
                                <select
                                    id="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                    disabled={loading}
                                >
                                    <option value="">Todos los colores</option>
                                    <option value="black_and_white">Blanco y Negro</option>
                                    <option value="black">Negro</option>
                                    <option value="white">Blanco</option>
                                    <option value="yellow">Amarillo</option>
                                    <option value="orange">Naranja</option>
                                    <option value="red">Rojo</option>
                                    <option value="purple">Morado</option>
                                    <option value="green">Verde</option>
                                    <option value="blue">Azul</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 shadow-sm ${
                                    loading 
                                    ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow'
                                }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Buscando...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                        </svg>
                                        Buscar Imágenes
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
                
                {/* Mensajes de error */}
                {error && (
                    <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-md" role="alert">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Indicador de carga inicial */}
                {initialLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
                        <p className="mt-4 text-gray-600 font-medium">Cargando imágenes destacadas...</p>
                    </div>
                )}
                
                {/* Indicador de carga de búsqueda */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
                        <p className="mt-4 text-gray-600 font-medium">Buscando imágenes...</p>
                    </div>
                )}
                
                {/* Resultados - Galería tipo Masonry (como Pexels) */}
                {!initialLoading && !loading && imagenes.length > 0 && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {searchPerformed ? 'Resultados de tu búsqueda' : 'Imágenes destacadas'}
                            </h2>
                            <span className="text-sm text-gray-500">{imagenes.length} imágenes encontradas</span>
                        </div>
                        
                        {/* Layout tipo Masonry */}
                        <div className="flex flex-wrap -mx-2">
                            {columnasDeImagenes.map((columna, colIndex) => (
                                <div key={colIndex} className="px-2 w-full sm:w-1/2 md:w-1/3 xl:w-1/4">
                                    <div className="flex flex-col gap-4">
                                        {columna.map((imagen) => (
                                            <div 
                                                key={imagen.id} 
                                                className="relative rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                                                onClick={() => abrirModal(imagen.urls.full)}
                                            >
                                                <img
                                                    src={imagen.urls.small}
                                                    alt={imagen.alt_description || 'Imagen de búsqueda'}
                                                    className="w-full object-cover rounded-lg"
                                                    style={{
                                                        height: 'auto',
                                                        // Ajustamos altura según la proporción de la imagen 
                                                        // (esto mantiene las proporciones originales)
                                                    }}
                                                    loading="lazy"
                                                />
                                                
                                                {/* Overlay con información al hacer hover */}
                                                <div 
                                                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 rounded-lg"
                                                >
                                                    {imagen.alt_description && (
                                                        <p className="text-white text-sm font-medium line-clamp-2 mb-2">
                                                            {imagen.alt_description}
                                                        </p>
                                                    )}
                                                    
                                                    <div className="flex justify-between items-center">
                                                        <button 
                                                            className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full hover:bg-white/40 transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                abrirModal(imagen.urls.full);
                                                            }}
                                                        >
                                                            Ver completa
                                                        </button>
                                                        
                                                        {imagen.user && (
                                                            <div className="flex items-center gap-2">
                                                                {imagen.user.profile_image?.small && (
                                                                    <img 
                                                                        src={imagen.user.profile_image.small} 
                                                                        alt={imagen.user.name}
                                                                        className="w-6 h-6 rounded-full border border-white/30"
                                                                    />
                                                                )}
                                                                <span className="text-xs text-white/90 font-medium truncate max-w-[80px]">
                                                                    {imagen.user.name}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Estado: No hay resultados (pero no está cargando) */}
                {!initialLoading && !loading && imagenes.length === 0 && !error && (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-4 text-lg">No hay imágenes para mostrar</p>
                        <p className="text-sm">Intenta con otra búsqueda</p>
                    </div>
                )}
            </div>
            
            {/* Footer */}
            <footer className="bg-gray-100 border-t border-gray-200 mt-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-gray-500 text-sm">
                        Imágenes proporcionadas por Unsplash API
                    </p>
                </div>
            </footer>
            
            {/* Modal para ver la imagen completa */}
            {modalOpen && (
                <div 
                    onClick={manejarClickFuera} 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm transition-opacity duration-300"
                >
                    <div className="relative max-w-5xl w-full max-h-[90vh] p-2">
                        <div className="absolute top-2 right-2 z-10">
                            <button 
                                onClick={cerrarModal} 
                                className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                                aria-label="Cerrar"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <img 
                            src={selectedImage} 
                            alt="Imagen completa" 
                            className="max-w-full max-h-[90vh] mx-auto object-contain rounded-lg" 
                            loading="eager"
                        />
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/40 text-white text-xs py-1 px-3 rounded-full backdrop-blur-sm">
                            Presiona ESC o haz clic fuera para cerrar
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BuscarImagenes;