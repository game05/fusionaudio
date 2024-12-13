import FileUploader from '@/components/FileUploader'

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Fusion Audio
        </h1>
        
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <FileUploader />
        </div>
      </div>
    </main>
  )
}
