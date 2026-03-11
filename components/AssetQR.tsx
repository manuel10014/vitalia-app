import { QRCodeSVG } from 'qrcode.react';

interface AssetQRProps {
  tagId: string;
  assetName: string;
}

export function AssetQR({ tagId, assetName }: AssetQRProps) {
  return (
    <div className="flex flex-col items-center p-4 bg-white border rounded-lg shadow-sm">
      <QRCodeSVG 
        value={tagId} 
        size={160}
        level={"H"}
        includeMargin={true}
      />
      <div className="mt-3 text-center">
        <p className="text-sm font-bold text-slate-900 truncate w-40">{assetName}</p>
        <code className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
          {tagId}
        </code>
      </div>
    </div>
  );
}