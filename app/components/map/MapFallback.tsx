import { MAP_WIDTH } from "@/lib/styles"

export default function MapFallback() {
  return (
    <div style={{ maxWidth: MAP_WIDTH }} className="w-full h-screen bg-gray-200 flex items-center justify-center">
      {/* <p>Loading map...</p> */}
    </div>
  )
}
