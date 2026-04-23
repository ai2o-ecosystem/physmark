# PhysMark 功能测试

## 数学公式

### 行内公式
图论中，图 $G = (V, E)$ 由顶点集 $V$ 和边集 $E$ 组成，其中每条边 $(u, v) \in E$ 连接两个顶点。

时间复杂度 $O(n \log n)$，空间复杂度 $O(1)$。

### 块级公式

$$
\begin{aligned}
\nabla \times \vec{E} &= -\frac{\partial \vec{B}}{\partial t} \\
\nabla \times \vec{B} &= \mu_0 \vec{J} + \mu_0 \epsilon_0 \frac{\partial \vec{E}}{\partial t}
\end{aligned}
$$

分布式系统的 CAP 定理：

$$
\text{Consistency} + \text{Availability} + \text{Partition Tolerance} \implies \text{Choose 2}
$$

## 代码高亮

```python
def dijkstra(graph, start):
    """最短路径算法"""
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    pq = [(0, start)]

    while pq:
        current_dist, current = heapq.heappop(pq)
        if current_dist > distances[current]:
            continue
        for neighbor, weight in graph[current]:
            distance = current_dist + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(pq, (distance, neighbor))
    return distances
```

```rust
fn main() {
    let mut graph = HashMap::new();
    graph.insert("A", vec![("B", 1), ("C", 4)]);
    println!("Graph: {:?}", graph);
}
```

## 表格

| 算法 | 时间复杂度 | 空间复杂度 | 适用场景 |
|------|-----------|-----------|---------|
| 快速排序 | $O(n \log n)$ | $O(\log n)$ | 通用排序 |
| 归并排序 | $O(n \log n)$ | $O(n)$ | 稳定排序 |
| 堆排序 | $O(n \log n)$ | $O(1)$ | 原地排序 |
| 计数排序 | $O(n + k)$ | $O(k)$ | 整数排序 |

## 任务列表

- [x] 实现核心架构
- [x] 添加数学公式支持
- [x] 添加代码高亮
- [ ] 实现 Tauri 桌面端
- [ ] 发布 VSCode 扩展

## 引用块

> 分布式系统的本质是在不可靠的网络上构建可靠的服务。
>
> — Leslie Lamport

## 删除线和强调

~~旧的实现方案~~ 已废弃，现在使用 **新的插件架构**。

支持 *斜体*、**粗体**、***粗斜体***。

## 脚注

分布式共识算法[^1]是构建高可用系统的基础，常见的有 Paxos[^2] 和 Raft[^3]。

[^1]: 分布式共识：多个节点就某个值达成一致的过程
[^2]: Paxos：Leslie Lamport 1998 年提出的共识算法
[^3]: Raft：Diego Ongaro 2014 年提出，更易理解的共识算法

## 物理模拟

下面是一个简单的重力模拟：

```physmark
{
  "gravity": [0, -9.81, 0],
  "bodies": [
    {
      "type": "dynamic",
      "shape": "sphere",
      "position": [0, 5, 0],
      "mass": 1.0,
      "size": 0.5,
      "color": "#ef4444",
      "restitution": 0.8
    },
    {
      "type": "static",
      "shape": "box",
      "position": [0, -0.5, 0],
      "size": [8, 1, 8],
      "color": "#10b981"
    }
  ],
  "camera": {
    "position": [8, 6, 8],
    "lookAt": [0, 2, 0]
  },
  "duration": 10
}
```
