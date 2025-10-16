const InfoRow = ({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value?: string;
}) => (
    <div className="flex items-center space-x-3 border-b pb-2">
        <span className="text-blue-600">{icon}</span>
        <span className="text-sm font-semibold text-gray-700 w-28">{label}:</span>
        <span className="text-sm text-gray-600 flex-1">{value}</span>
    </div>
);
export default InfoRow;