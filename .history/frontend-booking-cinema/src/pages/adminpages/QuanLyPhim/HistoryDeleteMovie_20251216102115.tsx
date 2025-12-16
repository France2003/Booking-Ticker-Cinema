import React, { useEffect, useState } from "react";
import { Table, Tag, Input, DatePicker, Space, Card, Spin, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { historyDeleteShowTimes } from "../../../services/movies/movie";
import type { ColumnsType } from "antd/es/table";
const { RangePicker } = DatePicker;

interface MovieHistory {
    _id: string;
    movieId: string;
    tieuDe: string;
    trangThai: string;
    ngayKhoiChieu?: string;
    thoiLuong?: number;
    deletedBy?: string;
    reason?: string;
    deletedAt: string;
}
const MovieDeleteHistory: React.FC = () => {
    const [history, setHistory] = useState<MovieHistory[]>([]);
    const [filtered, setFiltered] = useState<MovieHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await historyDeleteShowTimes();
                console.log("📦 API trả về:", data);
                setHistory(data);
                setFiltered(data);
            } catch (error) {
                console.error("Lỗi khi tải lịch sử xóa phim:", error);
                message.error("Không thể tải lịch sử xóa phim!");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    /** 🔍 Lọc realtime */
    useEffect(() => {
        let result = [...history];

        // Tìm kiếm theo tên phim
        if (searchTerm.trim() !== "") {
            result = result.filter((h) =>
                h.tieuDe.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Lọc theo ngày xóa
        if (dateRange[0] && dateRange[1]) {
            const [from, to] = dateRange;
            result = result.filter((h) => {
                const deleted = dayjs(h.deletedAt);
                return deleted.isAfter(from, "day") && deleted.isBefore(to, "day");
            });
        }

        setFiltered(result);
    }, [searchTerm, dateRange, history]);

    const columns: ColumnsType<MovieHistory> = [
        {
            title: "Tên phim",
            dataIndex: "tieuDe",
            key: "tieuDe",
            render: (text) => <strong>{text}</strong>,
        },
        {
            title: "Trạng thái",
            dataIndex: "trangThai",
            key: "trangThai",
            render: (status) => {
                let color = "default";
                let text = "";
                switch (status) {
                    // case "dangChieu":
                    //     color = "green";
                    //     text = "Đang chiếu";
                    //     break;
                    // case "sapChieu":
                    //     color = "blue";
                    //     text = "Sắp chiếu";
                    //     break;
                    default:
                        color = "red";
                        text = "Ngừng chiếu";
                }
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: "Khởi chiếu",
            dataIndex: "ngayKhoiChieu",
            key: "ngayKhoiChieu",
            render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "—"),
        },
        {
            title: "Ngày xóa",
            dataIndex: "deletedAt",
            key: "deletedAt",
            render: (date) => dayjs(date).format("HH:mm DD/MM/YYYY"),
            // sorter: (a, b) => dayjs(a.deletedAt).unix() - dayjs(b.deletedAt).unix(),
            defaultSortOrder: "descend",
        },
        {
            title: "Thời lượng",
            dataIndex: "thoiLuong",
            key: "thoiLuong",
            render: (value) => (value ? `${value} phút` : "—"),
        },
        {
            title: "Người xóa",
            dataIndex: "deletedBy",
            key: "deletedBy",
            render: (value) => value || "Hệ thống",
        },
        {
            title: "Lý do",
            dataIndex: "reason",
            key: "reason",
            render: (value) => value || "—",
        },
    ];

    return (
        <Card
            title="🧾 Lịch sử xóa phim"
            className="max-w-7xl mx-auto mt-8 shadow-md rounded-xl"
        >
            <Space
                style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}
                wrap
            >
                <Input
                    prefix={<SearchOutlined />}
                    placeholder="Tìm kiếm tên phim..."
                    style={{ width: 280 }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <RangePicker
                    format="DD/MM/YYYY"
                    onChange={(range) => setDateRange(range || [null, null])}
                    placeholder={["Từ ngày", "Đến ngày"]}
                />
            </Space>

            <Spin spinning={loading} tip="Đang tải dữ liệu...">
                <Table
                    columns={columns}
                    dataSource={filtered}
                    rowKey="_id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: false,
                        showTotal: (total) => `Tổng cộng ${total} bản ghi`,
                    }}
                />
            </Spin>
        </Card>
    );
};

export default MovieDeleteHistory;
