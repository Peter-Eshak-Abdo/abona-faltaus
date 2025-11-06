import { QRCodeSVG } from "qrcode.react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface QRCodeSectionProps {
  joinUrl: string
  qrSize: number
  setQrSize: (size: number) => void
}

export function QRCodeSection({ joinUrl, qrSize, setQrSize }: QRCodeSectionProps) {
  return (
    <Card className="shadow-2xl overflow-hidden shrink-3 grow">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-black">
        <CardTitle className="flex items-center gap-1 text-2xl font-bold text-center">
          الانضمام للمسابقة
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center p-1">
        {joinUrl && (
          <>
            <div className="bg-gray-50 p-0.5 rounded-2xl inline-block mb-1 border-2 border-gray-200">
              <QRCodeSVG value={joinUrl} size={qrSize} />
            </div>

            {/* QR Size Controls */}
            <div className="mb-1 px-1">
              <div className="flex items-center justify-between mb-1">
                <Button
                  onClick={() => setQrSize(Math.max(250, qrSize - 75))}
                  className="p-1 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors mb:p-1"
                  title="تقليل حجم الكود"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-dash-circle fw-bolder" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                    <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8" />
                  </svg>
                </Button>
                <span className="text-2xl font-extrabold text-gray-700 bg-gray-100 p-1 rounded-xl">{qrSize}px</span>
                <Button
                  onClick={() => setQrSize(Math.min(1000, qrSize + 75))}
                  className="p-1 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors mb:p-1"
                  title="زيادة حجم الكود"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-plus-circle fw-bolder" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                  </svg>
                </Button>
              </div>
              <div className="relative mb-1">
                <div className="absolute inset-0 bg-gradient-to-l from-blue-600 to-purple-600 h-2 rounded-full" />
                <Slider
                  value={[qrSize]}
                  onValueChange={(value) => setQrSize(value[0])}
                  max={1000}
                  min={250}
                  step={25}
                  className="custom-slider w-full"
                  dir="rtl"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>صغير</span>
                  <span>كبير</span>
                </div>
              </div>
              <style jsx>{`
                .custom-slider [data-radix-slider-track] {
                  background: transparent !important;
                }
              `}</style>
            </div>
            {/* <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${((qrSize - 250) / (1000 - 250)) * 100}%` }}
              />
            </div> */}

            <p className="text-gray-600 mb-1 text-lg font-medium">امسح الكود أو ادخل على:</p>
            <div className="bg-gray-100 p-1 rounded-xl border-2 border-gray-200">
              <p className="font-mono text-sm break-all text-gray-800 font-medium">{joinUrl}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
