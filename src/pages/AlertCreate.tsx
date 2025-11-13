import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Form, Input, Select, Button, Space, message } from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { alertService } from '@/services/alertService'
import { AlertSeverity, CreateAlertRequest } from '@/types'

const { TextArea } = Input
const { Option } = Select

const AlertCreate = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: CreateAlertRequest) => {
    try {
      setLoading(true)
      await alertService.createAlert(values)
      message.success('Alert created successfully')
      navigate('/alerts')
    } catch (error) {
      message.error('Failed to create alert')
      console.error('Failed to create alert:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/alerts')}>
          Back to List
        </Button>
      </Space>

      <Card title="Create New Alert">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            severity: AlertSeverity.MEDIUM,
          }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input the title!' }]}
          >
            <Input placeholder="Enter alert title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input the description!' }]}
          >
            <TextArea rows={4} placeholder="Enter alert description" />
          </Form.Item>

          <Form.Item
            name="severity"
            label="Severity"
            rules={[{ required: true, message: 'Please select the severity!' }]}
          >
            <Select placeholder="Select severity">
              {Object.values(AlertSeverity).map((severity) => (
                <Option key={severity} value={severity}>
                  {severity}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="source"
            label="Source"
            rules={[{ required: true, message: 'Please input the source!' }]}
          >
            <Input placeholder="Enter alert source (e.g., monitoring-system, api-gateway)" />
          </Form.Item>

          <Form.Item name="assignee" label="Assignee">
            <Input placeholder="Enter assignee email or username" />
          </Form.Item>

          <Form.Item name="tags" label="Tags">
            <Select
              mode="tags"
              placeholder="Add tags (press enter to add)"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
              >
                Create Alert
              </Button>
              <Button onClick={() => navigate('/alerts')}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default AlertCreate
