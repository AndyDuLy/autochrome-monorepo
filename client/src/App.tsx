import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

const ImageProcessor = () => {
  const [originalImage, setOriginalImage] = useState("");
  const [processedImage, setProcessedImage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState({
    yellowTint: 0,
    greenTint: 0,
    magentaTint: 0,
    filmGrain: 0,
  });

  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append("image", file);

    Object.entries(settings).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    try {
      const response = await fetch("http://localhost:3000/api/process-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setOriginalImage(`http://localhost:3000${data.original}`);
      setProcessedImage(`http://localhost:3000${data.processed}`);
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSettingChange = async (setting: string, value: number) => {
    const newSettings = { ...settings, [setting]: value };
    setSettings(newSettings);

    if (originalImage) {
      setIsProcessing(true);
      const formData = new FormData();

      const response = await fetch(originalImage);
      const blob = await response.blob();
      formData.append("image", blob);

      Object.entries(newSettings).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      try {
        const response = await fetch(
          "http://localhost:3000/api/process-image",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        setProcessedImage(`http://localhost:3000${data.processed}`);
      } catch (error) {
        console.error("Error updating image:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDownload = async () => {
    if (processedImage) {
      const response = await fetch(processedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "processed-image.jpg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Autochrome Image Processor
          </h1>
          <p className="text-lg text-gray-600">
            Upload an image to apply autochrome effects and compare
            before/after:
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Card className="lg:col-span-8">
            <CardContent className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
              </div>
              {originalImage && (
                <div className="flex flex-wrap">
                  {/* Original Image */}
                  <div className="w-full lg:w-1/2">
                    <h3 className="text-lg font-medium mb-2 text-center">
                      Original:
                    </h3>
                    <img
                      src={originalImage}
                      alt="Original"
                      className="w-full rounded-lg shadow"
                    />
                  </div>

                  {/* Processed Image */}
                  <div className="w-full lg:w-1/2">
                    <h3 className="text-lg font-medium mb-2 text-center">
                      Processed:
                    </h3>
                    {isProcessing ? (
                      <div className="animate-pulse bg-gray-200 rounded-lg aspect-square w-full" />
                    ) : (
                      <img
                        src={processedImage}
                        alt="Processed"
                        className="w-full rounded-lg shadow"
                      />
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-4">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-6">Adjustments</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yellow Tint
                  </label>
                  <Slider
                    value={[settings.yellowTint]}
                    onValueChange={([value]) =>
                      handleSettingChange("yellowTint", value)
                    }
                    max={100}
                    step={1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Green Tint
                  </label>
                  <Slider
                    value={[settings.greenTint]}
                    onValueChange={([value]) =>
                      handleSettingChange("greenTint", value)
                    }
                    max={100}
                    step={1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Magenta Tint
                  </label>
                  <Slider
                    value={[settings.magentaTint]}
                    onValueChange={([value]) =>
                      handleSettingChange("magentaTint", value)
                    }
                    max={100}
                    step={1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Film Grain
                  </label>
                  <Slider
                    value={[settings.filmGrain]}
                    onValueChange={([value]) =>
                      handleSettingChange("filmGrain", value)
                    }
                    max={100}
                    step={1}
                  />
                </div>

                <Button
                  onClick={handleDownload}
                  disabled={!processedImage}
                  className="w-full"
                >
                  Download Processed Image
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ImageProcessor;
