interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}
const InputField: React.FC<InputFieldProps> = ({ label, ...props }) => (
    <div>
        <label className="block text-gray-700 font-semibold mb-1">{label}</label>
        <input
            {...props}
            className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${props.readOnly || props.disabled
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : ""
                }`}
        />
    </div>
);
export default InputField;