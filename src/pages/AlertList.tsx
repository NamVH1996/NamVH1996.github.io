import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Card,
  Popconfirm,
  message,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { alertService } from '@/services/alertService'
import { Alert, AlertSeverity, AlertStatus, AlertFilter } from '@/types'
import dayjs from 'dayjs'

const { Option } = Select

const AlertList = () => {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [filters, setFilters] = useState<AlertFilter>({})

  useEffect(() => {
    fetchAlerts()
  }, [pagination.current, pagination.pageSize, filters])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const response = await alertService.getAlerts(
        pagination.current,
        pagination.pageSize,
        filters
      )
      setAlerts(response.data)
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }))
    } catch (error) {
      message.error('Failed to fetch alerts')
      console.error('Failed to fetch alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await alertService.deleteAlert(id)
      message.success('Alert deleted successfully')
      fetchAlerts()
    } catch (error) {
      message.error('Failed to delete alert')
      console.error('Failed to delete alert:', error)
    }
  }

  const getSeverityColor = (severity: AlertSeverity) => {
    const colors = {
      [AlertSeverity.LOW]: 'green',
      [AlertSeverity.MEDIUM]: 'orange',
      [AlertSeverity.HIGH]: 'red',
      [AlertSeverity.CRITICAL]: 'purple',
    }
    return colors[severity]
  }

  const getStatusColor = (status: AlertStatus) => {
    const colors = {
      [AlertStatus.OPEN]: 'red',
      [AlertStatus.IN_PROGRESS]: 'orange',
      [AlertStatus.RESOLVED]: 'green',
      [AlertStatus.CLOSED]: 'default',
    }
    return colors[status]
  }

  const columns: ColumnsType<Alert> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 250,
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      width: 120,
      render: (severity: AlertSeverity) => (
        <Tag color={getSeverityColor(severity)}>{severity}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: AlertStatus) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      width: 150,
    },
    {
      title: 'Assignee',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 150,
      render: (assignee) => assignee || '-',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/alerts/${record.id}`)}
          >
            View
          </Button>
          <Popconfirm
            title="Are you sure to delete this alert?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/alerts/create')}
            >
              Create Alert
            </Button>
          </Space>

          <Space style={{ width: '100%', marginBottom: 16 }}>
            <Input
              placeholder="Search alerts..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
            <Select
              mode="multiple"
              placeholder="Filter by severity"
              style={{ width: 250 }}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, severity: value }))
              }
            >
              {Object.values(AlertSeverity).map((severity) => (
                <Option key={severity} value={severity}>
                  {severity}
                </Option>
              ))}
            </Select>
            <Select
              mode="multiple"
              placeholder="Filter by status"
              style={{ width: 250 }}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
            >
              {Object.values(AlertStatus).map((status) => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={alerts}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`,
          }}
          onChange={(newPagination) => {
            setPagination({
              current: newPagination.current || 1,
              pageSize: newPagination.pageSize || 10,
              total: pagination.total,
            })
          }}
        />
      </Card>
    </div>
  )
}

export default AlertList
