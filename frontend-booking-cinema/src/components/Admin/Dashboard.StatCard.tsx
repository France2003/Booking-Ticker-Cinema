type StatCardProps = {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
  icon?: React.ReactNode;
};
const StatCard = ({ title, value, change, positive, icon }: StatCardProps) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <span className={`${positive ? "text-green-600" : "text-red-600"} text-sm`}>
        {change}
      </span>
    </div>
  );
};

export default StatCard;
