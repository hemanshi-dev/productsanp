import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-[300px] font-semibold text-primary mb-4">404</h1>
        <h2 className="text-4xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="feature-btn px-6 py-3 font-semibold bg-primary rounded-full hover:bg-black transition-all text-white inline-block text-center"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound

