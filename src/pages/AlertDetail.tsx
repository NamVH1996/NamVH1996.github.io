import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Spin,
  Modal,
  Form,
  Select,
  Input,
  message,
} from 'antd'
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { alertService } from '@/services/alertService'
import { Alert, AlertSeverity, AlertStatus, UpdateAlertRequest } from '@/types'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select

const AlertDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [alert, setAlert] = useState<Alert | null>(null)
  const [loading, setLoading] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (id) {
      fetchAlert(id)
    }
  }, [id])

  const fetchAlert = async (alertId: string) => {
    try {
      setLoading(true)
      const data = await alertService.getAlertById(alertId)
      setAlert(data)
      form.setFieldsValue(data)
    } catch (error) {
      message.error('Failed to fetch alert details')
      console.error('Failed to fetch alert:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (values: UpdateAlertRequest) => {
    if (!id) return

    try {
      await alertService.updateAlert(id, values)
      message.success('Alert updated successfully')
      setEditModalVisible(false)
      fetchAlert(id)
    } catch (error) {
      message.error('Failed to update alert')
      console.error('Failed to update alert:', error)
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

  if (loading || !alert) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/alerts')}>
          Back to List
        </Button>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => setEditModalVisible(true)}
        >
          Edit Alert
        </Button>
      </Space>

      <Card title="Alert Details">
        <Descriptions bordered column={2}>
          <Descriptions.Item label="ID" span={2}>
            {alert.id}
          </Descriptions.Item>
          <Descriptions.Item label="Title" span={2}>
            {alert.title}
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            {alert.description}
          </Descriptions.Item>
          <Descriptions.Item label="Severity">
            <Tag color={getSeverityColor(alert.severity)}>{alert.severity}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(alert.status)}>{alert.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Source">{alert.source}</Descriptions.Item>
          <Descriptions.Item label="Assignee">
            {alert.assignee || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Tags" span={2}>
            {alert.tags?.map((tag) => <Tag key={tag}>{tag}</Tag>) || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {dayjs(alert.createdAt).format('DD/MM/YYYY HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {dayjs(alert.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
          </Descriptions.Item>
          {alert.resolvedAt && (
            <Descriptions.Item label="Resolved At" span={2}>
              {dayjs(alert.resolvedAt).format('DD/MM/YYYY HH:mm:ss')}
            </Descriptions.Item>
          )}
          {alert.metadata && (
            <Descriptions.Item label="Metadata" span={2}>
              <pre>{JSON.stringify(alert.metadata, null, 2)}</pre>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Modal
        title="Edit Alert"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input the title!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input the description!' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="severity"
            label="Severity"
            rules={[{ required: true, message: 'Please select the severity!' }]}
          >
            <Select>
              {Object.values(AlertSeverity).map((severity) => (
                <Option key={severity} value={severity}>
                  {severity}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select the status!' }]}
          >
            <Select>
              {Object.values(AlertStatus).map((status) => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="assignee" label="Assignee">
            <Input />
          </Form.Item>

          <Form.Item name="tags" label="Tags">
            <Select mode="tags" placeholder="Add tags" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AlertDetail
