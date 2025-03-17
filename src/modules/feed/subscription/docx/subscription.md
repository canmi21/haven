### 注册用户

用于注册新的订阅用户。需要提供用户名、过期天数和数据配额。

**路径:** `/v1/feeds/subscription/register`

**方法:** `GET`

**需要 TOTP 验证:** 是

**查询参数:**

* `user` (必填): 用户名，只能包含 0-9, A-Z, a-z, 和 _。
* `expire`: 过期天数，整数，范围 0-365，默认为 30。
* `quota`: 数据配额，整数，范围 0-500，默认为 30。

**成功响应:**

```
{
  "code": 200,
  "message": "User registered successfully",
  "data": {
    "id": "001",
    "token": "your-generated-token"
  }
}
```

**错误响应:**

- 400 Bad Request: 请求参数错误，例如用户名格式错误、过期天数或配额超出范围。
- 409 Conflict: 用户名已存在。
- 429 Too Many Requests: 达到速率限制。
- 500 Internal Server Error: 服务器内部错误。

**示例 Curl:**

```
curl -X GET "https://api.canmi.icu/v1/feeds/subscription/register?user=testuser&expire=60&quota=50" -H "X-TOTP-Token: your_totp_token"
```

### 更新用户

用于更新现有订阅用户的过期天数和数据配额。可以通过用户ID或用户名来指定用户。

**路径:** `/v1/feeds/subscription/update`

**方法:** `GET`

**需要 TOTP 验证:** 是

**查询参数:**

* `id`: 用户ID。提供此参数或 `user` 参数。
* `user`: 用户名。提供此参数或 `id` 参数。
* `expire`: 过期天数，整数，范围 0-365。如果提供，将更新用户的过期日期。
* `quota`: 数据配额，整数，范围 0-500。如果提供，将更新用户的数据配额。

**成功响应:**

```
{
  "code": 200,
  "message": "User updated successfully",
  "data": {}
}
```

**错误响应:**

- 400 Bad Request: 请求参数错误，例如未提供用户ID或用户名，过期天数或配额超出范围。
- 404 Not Found: 用户未找到。
- 429 Too Many Requests: 达到速率限制。
- 500 Internal Server Error: 服务器内部错误。

**示例 Curl (使用用户名):**

```
curl -X GET "https://api.canmi.icu/v1/feeds/subscription/update?user=testuser&expire=90&quota=100" -H "X-TOTP-Token: your_totp_token"
```

**示例 Curl (使用用户ID):**

```
curl -X GET "https://api.canmi.icu/v1/feeds/subscription/update?id=001&expire=90&quota=100" -H "X-TOTP-Token: your_totp_token"
```

### 获取订阅配置

根据用户ID或用户名和用户令牌获取订阅配置信息（YAML 格式）。

**路径:** `/v1/feeds/subscription`

**方法:** `GET`

**查询参数:**

* `id`: 用户ID。提供此参数或 `user` 参数。
* `user`: 用户名。提供此参数或 `id` 参数。
* `token` (必填): 用户令牌。

**成功响应:**

返回 YAML 格式的订阅配置。

**错误响应:**

- 400 Bad Request: 请求参数错误，例如未提供用户ID或用户名，或缺少令牌。
- 401 Unauthorized: 无效的用户ID/用户名或令牌。
- 403 Forbidden: 订阅已过期。
- 429 Too Many Requests: 达到速率限制。
- 500 Internal Server Error: 服务器内部错误。

**示例 Curl (使用用户ID):**

```
curl -X GET "https://api.canmi.icu/v1/feeds/subscription?id=001&token=your-generated-token"
```

**示例 Curl (使用用户名):**

```
curl -X GET "https://api.canmi.icu/v1/feeds/subscription?user=testuser&token=your-generated-token"
```

### 获取用户令牌

根据用户ID或用户名获取用户的令牌。

**路径:** `/v1/feeds/subscription/token`

**方法:** `GET`

**需要 TOTP 验证:** 是

**查询参数:**

* `id`: 用户ID。提供此参数或 `user` 参数。
* `user`: 用户名。提供此参数或 `id` 参数。

**成功响应:**

```
{
  "code": 200,
  "message": "User token retrieved successfully",
  "data": {
    "token": "your-generated-token"
  }
}
```

**错误响应:**

- 400 Bad Request: 请求参数错误，例如未提供用户ID或用户名。
- 404 Not Found: 用户未找到。
- 429 Too Many Requests: 达到速率限制。
- 500 Internal Server Error: 服务器内部错误。

**示例 Curl (使用用户ID):**

```
curl -X GET "https://api.canmi.icu/v1/feeds/subscription/token?id=001" -H "X-TOTP-Token: your_totp_token"
```

**示例 Curl (使用用户名):**

```
curl -X GET "https://api.canmi.icu/v1/feeds/subscription/token?user=testuser" -H "X-TOTP-Token: your_totp_token"
```

### 重命名用户

根据旧用户名或用户ID重命名用户。

**路径:** `/v1/feeds/subscription/rename`

**方法:** `GET`

**需要 TOTP 验证:** 是

**查询参数:**

* `user`: 旧用户名。提供此参数或 `id` 参数。
* `id`: 用户ID。提供此参数或 `user` 参数。
* `name` (必填): 新用户名，只能包含 0-9, A-Z, a-z, 和 _。

**成功响应:**

```
{
  "code": 200,
  "message": "User renamed successfully",
  "data": {}
}
```

**错误响应:**

- 400 Bad Request: 请求参数错误，例如未提供旧用户名或用户ID，或新用户名格式错误。
- 404 Not Found: 用户未找到。
- 409 Conflict: 新用户名已存在。
- 429 Too Many Requests: 达到速率限制。
- 500 Internal Server Error: 服务器内部错误。

**示例 Curl (使用旧用户名):**

```
curl -X GET "https://api.canmi.icu/v1/feeds/subscription/rename?user=olduser&name=newuser" -H "X-TOTP-Token: your_totp_token"
```

**示例 Curl (使用用户ID):**

```
curl -X GET "https://api.canmi.icu/v1/feeds/subscription/rename?id=001&name=newuser" -H "X-TOTP-Token: your_totp_token"
```

### 获取用户信息

根据用户名或用户ID获取用户的详细信息。

**路径:** `/v1/feeds/subscription/info`

**方法:** `GET`

**需要 TOTP 验证:** 是

**查询参数:**

* `user`: 用户名。提供此参数或 `id` 参数。
* `id`: 用户ID。提供此参数或 `user` 参数。

**成功响应:**

```
{
  "code": 200,
  "message": "User info retrieved successfully",
  "data": {
    "id": "001",
    "username": "testuser",
    "expireDate": "2025-05-16T13:21:00.000Z",
    "quota": 50,
    "token": "your-generated-token"
  }
}
```

**错误响应:**

- 400 Bad Request: 请求参数错误，例如未提供用户名或用户ID。
- 404 Not Found: 用户未找到。
- 429 Too Many Requests: 达到速率限制。
- 500 Internal Server Error: 服务器内部错误。

**示例 Curl (使用用户名):**

```
curl -X GET "https://api.canmi.icu/v1/feeds/subscription/info?user=testuser" -H "X-TOTP-Token: your_totp_token"
```

**示例 Curl (使用用户ID):**

```
curl -X GET "https://api.canmi.icu/v1/feeds/subscription/info?id=001" -H "X-TOTP-Token: your_totp_token"
```
