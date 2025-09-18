import { Card, CardContent } from "@/components/ui/card";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Loading() {
  return (
    <div className="py-5 flex justify-center">
      <div className="w-full max-w-2xl">
        <Card>
          <CardContent className="text-center">
            <LoadingSpinner />
            <p className="mt-3">جاري التحميل...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
