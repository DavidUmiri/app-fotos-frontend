import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;

if (!UNSPLASH_ACCESS_KEY) {
    console.error('La clave de API de Unsplash no está configurada. Por favor, configure la variable de entorno REACT_APP_UNSPLASH_ACCESS_KEY');
}

// Crear una instancia de axios con la configuración base
const unsplashApi = axios.create({
    baseURL: 'https://api.unsplash.com',
    headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        'Accept-Version': 'v1'
    }
});

const BuscarImagenes = () => {
    const [query, setQuery] = useState('');
    const [cantidad, setCantidad] = useState(8);
    const [orientacion, setOrientacion] = useState('');
    const [color, setColor] = useState('');
    const [imagenes, setImagenes] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [rateLimit, setRateLimit] = useState({ remaining: '?', limit: '50', reset: null });

    // Función para obtener imágenes aleatorias al cargar la página
    useEffect(() => {
        const cargarImagenesIniciales = async () => {
            try {
                const temasAleatorios = [
                    'nature', 'architecture', 'travel', 
                    'technology', 'food', 'animals'
                ];
                const temaRandom = temasAleatorios[Math.floor(Math.random() * temasAleatorios.length)];
                
                const response = await unsplashApi.get('/search/photos', {
                    params: {
                        query: temaRandom,
                        per_page: 8,
                    }
                });
                
                if (response.headers['x-ratelimit-remaining']) {
                    setRateLimit({
                        remaining: response.headers['x-ratelimit-remaining'],
                        limit: response.headers['x-ratelimit-limit'],
                        reset: new Date(response.headers['x-ratelimit-reset'] * 1000)
                    });
                }

                setImagenes(response.data.results);
            } catch (error) {
                console.error("Error al cargar imágenes iniciales:", error.response || error);
                let mensajeError = "No se pudieron cargar las imágenes iniciales.";
                if (error.response?.status === 403) {
                    mensajeError += " Error de autenticación con Unsplash.";
                } else if (error.response?.status === 429) {
                    mensajeError += " Se ha alcanzado el límite de solicitudes.";
                }
                setError(mensajeError);
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
            const response = await unsplashApi.get('/search/photos', {
                params: {
                    query,
                    per_page: cantidad,
                    orientation: orientacion || null,
                    color: color || null,
                }
            });

            if (response.headers['x-ratelimit-remaining']) {
                setRateLimit({
                    remaining: response.headers['x-ratelimit-remaining'],
                    limit: response.headers['x-ratelimit-limit'],
                    reset: new Date(response.headers['x-ratelimit-reset'] * 1000)
                });
            }

            setImagenes(response.data.results);
            if (response.data.results.length === 0) {
                setError("No se encontraron imágenes para esta búsqueda");
            }
        } catch (error) {
            console.error("Error al buscar imágenes:", error.response || error);
            let mensajeError = "Error al buscar imágenes.";
            if (error.response?.status === 403) {
                mensajeError = "Error de autenticación con Unsplash.";
            } else if (error.response?.status === 429) {
                mensajeError = "Has alcanzado el límite de búsquedas. Por favor, espera un momento.";
            }
            setError(mensajeError);
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
                {/* Rate Limit Warning */}
                {rateLimit.remaining && parseInt(rateLimit.remaining) < 10 && (
                    <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md" role="alert">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    <span className="font-medium">Atención:</span> Quedan {rateLimit.remaining} búsquedas disponibles de {rateLimit.limit} en esta hora.                                    {rateLimit.reset && (
                                        <span className="ml-1">
                                            El límite se restablecerá en {(() => {
                                                const resetTime = new Date(rateLimit.reset);
                                                if (!isNaN(resetTime.getTime())) {
                                                    const minutesRemaining = Math.max(0, Math.floor((resetTime - new Date()) / 60000));
                                                    return `${minutesRemaining} minutos`;
                                                }
                                                return 'una hora';
                                            })()}.
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

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
                    
                    {/* Rate Limit Information */}
                    <div className="px-6 pb-4 flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span>
                                Búsquedas restantes: {rateLimit.remaining}/{rateLimit.limit}
                            </span>
                        </div>                {rateLimit.reset && (
                            <span>
                                Se restablece en: {(() => {
                                    const resetTime = new Date(rateLimit.reset);
                                    if (!isNaN(resetTime.getTime())) {
                                        const minutesRemaining = Math.max(0, Math.floor((resetTime - new Date()) / 60000));
                                        return `${minutesRemaining} minutos`;
                                    }
                                    return 'una hora';
                                })()}
                            </span>
                        )}
                    </div>
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
                                                onClick={() => abrirModal(imagen.urls.regular)}
                                            >
                                                <img
                                                    src={imagen.urls.small}
                                                    alt={imagen.alt_description || 'Imagen de búsqueda'}
                                                    className="w-full object-cover rounded-lg"
                                                    style={{
                                                        aspectRatio: `${imagen.width}/${imagen.height}`,
                                                    }}
                                                    loading="lazy"
                                                />
                                                
                                                {/* Overlay con información */}
                                                <div 
                                                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 rounded-lg"
                                                >
                                                    <div className="flex flex-col space-y-2">
                                                        {imagen.user && (
                                                            <a 
                                                                href={imagen.user.links.html} 
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {imagen.user.profile_image?.small && (
                                                                    <img 
                                                                        src={imagen.user.profile_image.small} 
                                                                        alt={imagen.user.name}
                                                                        className="w-6 h-6 rounded-full border border-white/30"
                                                                    />
                                                                )}
                                                                <span className="text-sm font-medium">
                                                                    {imagen.user.name}
                                                                </span>
                                                            </a>
                                                        )}
                                                        <div className="flex justify-between items-center">
                                                            <a 
                                                                href={imagen.links.html}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full hover:bg-white/40 transition-colors"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                Ver en Unsplash
                                                            </a>
                                                            <button
                                                                className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full hover:bg-white/40 transition-colors"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    abrirModal(imagen.urls.regular);
                                                                }}
                                                            >
                                                                Vista previa
                                                            </button>
                                                        </div>
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
            
            {/* Modal para vista completa */}
            {modalOpen && (
                <div 
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-8"
                    onClick={manejarClickFuera}
                >
                    <div className="relative max-w-7xl w-full max-h-[90vh] flex flex-col items-center">
                        {/* Botón cerrar */}
                        <button
                            onClick={cerrarModal}
                            className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Imagen */}
                        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                            <img
                                src={selectedImage}
                                alt="Vista completa"
                                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                            />
                        </div>

                        {/* Atribución Unsplash */}
                        <div className="absolute bottom-4 left-4 text-white/80 text-sm">
                            <p>Foto proporcionada por <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Unsplash</a></p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BuscarImagenes;