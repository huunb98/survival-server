Request Message:

- Name:
  type: string
  require: true
- Body: any
  type: any
  require: true

Response Message:

- Status:
  type: number
  require: true
- Error:
  type: string
  require: false
- Body: any
  type: any
  require: false
