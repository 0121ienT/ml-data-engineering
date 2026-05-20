export const meta = {
  title: "Bài tập lớn — Mở rộng tính năng & CI/CD Auto-Deploy",
  intro:
    "Mỗi nhóm tiếp tục đề tài học kỳ trước, được giao thêm 3 tính năng mới và phải thiết kế CI/CD pipeline tự động deploy lên cloud được cung cấp.",
  emphasis:
    "Tiêu chí then chốt: không chỉ chạy được mà phải thiết kế rõ ràng — chỉ rõ giả định, ràng buộc, latency budget và cách rollback.",
};

export const pipelineStages = [
  {
    stage: "Lint & format",
    requirement: "Black hoặc Ruff cho Python, ESLint cho JS/TS",
    failFast: "code không đúng style",
  },
  {
    stage: "Unit test",
    requirement: "Coverage tối thiểu 60% cho module logic chính",
    failFast: "test fail hoặc coverage tụt",
  },
  {
    stage: "Build image",
    requirement: "Multi-stage Dockerfile, image gọn và không chứa secret",
    failFast: "image quá lớn hoặc có secret",
  },
  {
    stage: "Security scan",
    requirement: "Quét CVE bằng trivy hoặc grype; chặn nếu có CVE HIGH chưa fix",
    failFast: "có CVE HIGH/CRITICAL",
  },
  {
    stage: "Push registry",
    requirement: "Push image lên ECR hoặc Docker Hub với 2 tag git-sha và latest",
    failFast: "credential sai",
  },
  {
    stage: "Integration test",
    requirement: "Compose lên DB/cache giả lập, gọi smoke test API thật",
    failFast: "smoke test không 200",
  },
  {
    stage: "Deploy staging",
    requirement: "SSH hoặc SSM vào EC2 staging, pull image, docker compose up -d",
    failFast: "health check fail trong 60s",
  },
  {
    stage: "Manual gate",
    requirement: "Approval qua GitHub Environment hoặc Jenkins input",
    failFast: "không có ai approve",
  },
  {
    stage: "Deploy prod",
    requirement: "Rolling update hoặc blue-green, có rollback tự động",
    failFast: "health check prod fail",
  },
  {
    stage: "Notify",
    requirement: "Gửi message Discord, Slack hoặc Telegram khi deploy xong hoặc fail",
    failFast: "—",
  },
];

export const deliverables = [
  "Sơ đồ pipeline vẽ bằng Excalidraw — chỉ rõ stage, artifact đi qua từng bước và nơi lưu secret.",
  "File THREAT-MODEL.md ngắn: tối thiểu 3 mối đe doạ chính kèm biện pháp giảm thiểu.",
  "File ROLLBACK.md: lệnh cụ thể để rollback về tag cũ trong vài phút.",
];

export const cloudResources = [
  "1 EC2 t3.large cho app prod; nhóm cần GPU thì đăng ký trước để được cấp g4dn.xlarge.",
  "1 EC2 t3.medium riêng làm staging.",
  "1 ECR private repo cho mỗi nhóm.",
  "1 S3 bucket cho mỗi nhóm để lưu model, log và backup.",
  "RDS Postgres db.t3.micro cho nhóm cần database; nhóm Hand Gesture xin thêm nếu cần.",
  "ElastiCache Redis cache.t3.micro cho nhóm cần cache.",
  "Domain test gắn vào IP và port của EC2, mở qua Security Group.",
];

export const cloudNote =
  "Tất cả tài nguyên gắn tag Owner và Course để dễ quản lý. Nhóm phải tự stop EC2 ngoài giờ làm bài, có script kèm phần Notify.";

export const groups = [
  {
    id: "nhom-1",
    number: 1,
    name: "Phân loại cảm xúc",
    codename: "BTL-Nhom1",
    tone: "violet",
    repo: "https://github.com/HIT-PYTHON-2026/BTL-Nhom1",
    summary:
      "ResNet phân loại cảm xúc khuôn mặt và YOLOv8-nano detect mặt. Backend FastAPI, frontend HTML/CSS/JS, đã có upload ảnh, livestream camera và mini-game.",
    features: [
      {
        title: "Multi-modal Emotion Fusion: Khuôn mặt + Giọng nói",
        description:
          "Thêm nhánh xử lý âm thanh song song với khuôn mặt. Stream micro qua WebRTC vào một mô hình Speech Emotion Recognition trên window 2 giây có overlap. Sau đó fusion với output video stream để cho ra một emotion score chung kèm độ tin cậy.",
        constraints: [
          "Đồng bộ timestamp audio và video frame trong khoảng 150 ms và mô tả cách xử lý drift.",
          "So sánh early fusion và late fusion, chọn 1 cách và giải thích ưu nhược điểm.",
          "Khi 1 trong 2 modality bị thiếu, pipeline vẫn trả kết quả với confidence điều chỉnh xuống.",
          "Latency end-to-end dưới 600 ms ở P95.",
        ],
      },
      {
        title: "Emotion Drift Monitoring + Online Retraining",
        description:
          "Mỗi prediction được log kèm confidence và embedding. Build dashboard drift detection theo tuần so với phân phối lúc train. Khi vượt ngưỡng thì trích sample khó vào S3, mở review UI gắn nhãn, retrain và deploy shadow trước khi promote.",
        constraints: [
          "Vẽ data flow Excalidraw từ inference log đến drift score, retrain, shadow và promote, có rõ điểm kill-switch.",
          "Schema feedback DB phải có audit trail: ai gắn nhãn, khi nào và lý do.",
          "Canary metric rõ ràng: model mới chỉ promote khi accuracy không tụt quá 2% trên holdout cố định.",
        ],
      },
      {
        title: "Multi-tenant Analytics Dashboard",
        description:
          "Cho phép tổ chức đăng ký 1 workspace. Mỗi workspace có RBAC, heatmap cảm xúc theo lớp hoặc ca, time-series xu hướng theo ngày và alert engine khi tỷ lệ negative vượt threshold.",
        constraints: [
          "Privacy: không lưu ảnh khuôn mặt raw quá 7 ngày, chỉ giữ embedding đã hash kèm metadata. Mô tả cách xoá tự động.",
          "Multi-tenancy: chọn pattern phù hợp và bảo vệ lựa chọn theo chi phí và mức cô lập dữ liệu.",
          "Integration test giả lập 2 workspace truy vấn cùng lúc, đảm bảo không leak dữ liệu chéo.",
        ],
      },
    ],
  },
  {
    id: "nhom-2",
    number: 2,
    name: "Hệ thống nhận diện biển số xe thông minh",
    codename: "Team2_Parking_Detection",
    tone: "amber",
    repo: "https://github.com/HIT-PYTHON-2026/Team2_Parking_Detection",
    summary:
      "YOLOv8 detect xe và slot trống, dynamic calibration theo độ phân giải. Backend FastAPI, dashboard Streamlit, đã có /health /detect /stream.",
    features: [
      {
        title: "Nhận diện biển số + Vehicle Registry + Billing",
        description:
          "Sau khi YOLOv8 detect xe, crop bounding box biển số rồi preprocess và đưa vào OCR phù hợp biển Việt Nam. Match kết quả vào DB xe đăng ký, ghi log entry và exit, tính phí gửi theo bảng giá có thể cấu hình.",
        constraints: [
          "Hậu xử lý kết quả OCR bằng whitelist ký tự cộng thêm so khớp gần đúng với danh sách xe đã đăng ký.",
          "Chống double-billing: cùng xe quét nhiều khung liên tiếp chỉ tạo 1 session. Mô tả state machine ENTER, INSIDE, EXIT kèm timeout.",
          "Báo cáo thử nghiệm tối thiểu 20 ảnh khó tự chụp, bao gồm xe khuất một phần biển hoặc ánh sáng yếu.",
          "Schema billing có 4 bảng vehicle, session, rate_card và transaction kèm migration script.",
        ],
      },
      {
        title: "Multi-camera Fusion + Cross-frame Tracking",
        description:
          "Nhiều camera quay cùng 1 bãi từ các góc khác nhau. Stream qua message queue thay vì HTTP trực tiếp. Dùng DeepSORT hoặc ByteTrack để track xuyên khung và xuyên camera, không đếm trùng khi xe di chuyển giữa các zone.",
        constraints: [
          "Đồng bộ camera qua NTP và mô tả cách bù khi camera mất kết nối tạm thời.",
          "Calibration đưa pixel của frame về sơ đồ 2D của bãi. Có tool calibration để click các điểm gốc lúc setup.",
          "Backpressure: queue không phình quá ngưỡng, drop frame cũ nhất với policy rõ ràng.",
          "Throughput tối thiểu 2 camera ở 10 FPS xử lý song song trên 1 GPU.",
        ],
      },
      {
        title: "Predictive Availability + Slot Recommendation",
        description:
          "Một model time-series dự đoán độ trống của bãi ở các mốc 15, 30 và 60 phút tới, dựa trên lịch sử và thời tiết. User hỏi tới sau bao nhiêu phút thì bãi còn không, hệ thống trả về xác suất kèm slot gợi ý.",
        constraints: [
          "Feature engineering rõ ràng: hour-of-day, day-of-week, holiday và thời tiết. Vẽ tầm quan trọng của feature.",
          "Versioning model rõ: nếu model mới predict lệch quá ngưỡng MAE trong tuần đầu thì tự rollback.",
          "Online evaluation: log mọi prediction kèm thời điểm dự đoán và so với thực tế khi tới mốc, vẽ MAE chart.",
          "Latency query phía user dưới 300 ms khi cache hit.",
        ],
      },
    ],
  },
  {
    id: "nhom-3",
    number: 3,
    name: "Hand Gesture (chưa có repo)",
    codename: "no-repo-yet",
    tone: "crimson",
    repo: null,
    summary:
      "Vì chưa có repo, nhóm bắt đầu từ Day 0 và bị chấm khắt khe hơn về design doc. Mỗi tính năng phải có sơ đồ kiến trúc, bảng API, schema dữ liệu và threat model riêng.",
    note: "Vì 3 tính năng cố ý phức tạp, nhóm được phép chọn 2 trên 3 để làm sâu nhưng phải viết design doc cho cả 3. Quyết định bỏ tính năng nào phải có lý do kỹ thuật rõ ràng.",
    features: [
      {
        title: "Vietnamese Sign Language Translator dạng streaming",
        description:
          "Stream webcam đi qua MediaPipe Holistic để lấy keypoint, sau đó đưa vào một temporal model để dịch sang câu tiếng Việt có ngữ pháp đúng. Có thể thêm TTS nếu còn thời gian.",
        hardLabel: "Khó",
        constraints: [
          "Streaming thay vì batch: dùng sliding window có overlap và beam search decoder. Định nghĩa rõ khi nào câu kết thúc.",
          "Latency dưới 500 ms ở P95 từ kết thúc gesture đến hiển thị câu dịch.",
          "Khi confidence dưới ngưỡng, hiển thị top-3 ứng viên cho user xác nhận.",
          "Dataset tự thu tối thiểu 100 câu của 2 người ký, kèm augment và annotation guideline.",
        ],
      },
      {
        title: "Multi-user Gesture Collaborative 3D Workspace",
        description:
          "Nhiều user mỗi người 1 webcam cùng vào 1 phòng, dùng gesture xoay, scale, di chuyển hoặc vẽ trên đối tượng 3D chung trong browser. Không truyền video, chỉ truyền pose keypoint giữa các client qua WebRTC DataChannel.",
        hardLabel: "Khó",
        constraints: [
          "Conflict resolution khi 2 user cùng grab 1 object: chọn CRDT hoặc OT, mô tả lý do và ví dụ minh hoạ.",
          "Gesture FSM mỗi tay có các state idle, tracking, engaged-pinch, drag, release, kèm state diagram và debounce time.",
          "UX rõ ràng: user nhìn được tay nào của ai đang điều khiển object nào, có ghosted cursor 3D màu theo user.",
          "Scale test với 3 user cùng phòng, FPS tối thiểu 24, RTT dưới 200 ms trên LAN.",
        ],
      },
      {
        title: "Adaptive Gesture Authentication",
        description:
          "User đăng ký gesture passphrase cá nhân là chuỗi 3 đến 5 gesture trong không gian 3D. Model học pattern theo người. Mỗi lần đăng nhập: kiểm tra liveness, so với template trong DB; nếu drift nhẹ thì cập nhật template.",
        hardLabel: "Khó",
        constraints: [
          "Threat model rõ ràng với tối thiểu 4 kịch bản tấn công, mỗi kịch bản đi kèm biện pháp giảm thiểu.",
          "Fallback khi auth fail 3 lần liên tiếp: lock tài khoản, gửi cảnh báo và mở fallback qua OTP.",
          "Privacy: template chỉ lưu embedding đã mã hoá at rest, có mô tả key rotation policy.",
          "Performance một lần auth end-to-end dưới 2 giây.",
        ],
      },
    ],
  },
  {
    id: "nhom-4",
    number: 4,
    name: "Fashion Visual Search Engine",
    codename: "image_retrieval — VOGUE FIND",
    tone: "teal",
    repo: "https://github.com/HIT-PYTHON-2026/image_retrieval",
    summary:
      "ResNet50 sinh embedding 2048-dim và lưu vào Milvus, dùng PostgreSQL và MinIO. Frontend React, đã có e-commerce features như cart, brand dashboard và RBAC.",
    features: [
      {
        title: "Hybrid Text + Image Search bằng CLIP",
        description:
          "Cho phép user kết hợp ảnh và text trong cùng 1 query. Swap ResNet50 sang CLIP, reindex Milvus với embedding mới. Hỗ trợ weighting giữa image và text, hỗ trợ negation chuyển sang filter SQL.",
        constraints: [
          "Migration: đổi model là đổi vector space, phải tạo collection Milvus mới song song và có feature flag để A/B test trước khi cắt sang.",
          "Re-ranking pass 2 với cross-encoder: từ top-100 chọn lại top-10.",
          "Latency search end-to-end dưới 500 ms ở P95 kể cả khi có rerank.",
          "Evaluation Recall@10 và MRR trên tập đánh giá tối thiểu 100 query có ground-truth tự build.",
        ],
      },
      {
        title: "Federated Learning Personalized Recommendation",
        description:
          "Lịch sử người dùng train một model nhỏ trên thiết bị. Client gửi gradient hoặc delta đã thêm DP-noise về server, server federated average thành model toàn cục. Không lưu raw behavior trên server.",
        constraints: [
          "Model nhỏ dưới 5 MB, distill từ một teacher model lớn hơn.",
          "DP-SGD có chọn privacy budget cụ thể và giải thích trade-off accuracy vs privacy.",
          "Anti-poisoning: client update có chữ ký, server có cơ chế chống malicious client thay vì trung bình đơn thuần.",
          "Evaluation: AB-test recommendation từ federated model so với baseline collaborative filtering trong tối thiểu 1 tuần.",
        ],
      },
      {
        title: "Inventory-aware Re-ranking + Sponsored Slot",
        description:
          "Khi user search, kết quả được re-rank theo stock, margin, brand bid, mùa và độ đa dạng thương hiệu. Brand dashboard mới hiển thị CTR, conversion theo slot và lịch sử bid minh bạch.",
        constraints: [
          "Learning-to-rank dùng LightGBM hoặc neural ranker, train trên click log có hiệu chỉnh counterfactual.",
          "Feature store online cập nhật stock, margin và bid trong vòng vài giây.",
          "Latency tổng của similarity search, rerank và auction dưới 300 ms ở P95.",
          "Fairness: brand nhỏ được đảm bảo hiển thị tối thiểu một tỉ lệ slot mỗi ngày.",
        ],
      },
    ],
  },
];

export const timeline = [
  { week: "1", goal: "Design doc", deliverable: "DESIGN.md cho mỗi tính năng, sơ đồ Excalidraw và threat model" },
  { week: "2", goal: "Setup CI cơ bản và repo skeleton", deliverable: "Lint và unit test pass trên GitHub Actions hoặc Jenkins" },
  { week: "3–4", goal: "Implement 3 tính năng", deliverable: "Code và unit test, mỗi feature 1 PR" },
  { week: "5", goal: "CI/CD hoàn chỉnh và deploy staging", deliverable: "Pipeline đầy đủ stage, deploy thành công lên staging" },
  { week: "6", goal: "Deploy prod và demo", deliverable: "Live demo, báo cáo và retro" },
];

export const folderStructure = `/docs
  DESIGN.md
  THREAT-MODEL.md
  ROLLBACK.md
  pipeline-diagram.png
/ci
  .github/workflows/  hoặc Jenkinsfile
/src
  ...
/scripts
  bootstrap-ec2.sh
  rollback.sh
/tests
  unit/
  integration/
README.md`;

export const grading = [
  { item: "CI/CD pipeline đủ stage, có manual gate và rollback chứng minh được", weight: "25%", criteria: "Demo deploy thành công lên cloud được cấp và rollback trong vài phút" },
  { item: "3 tính năng mới hoạt động đúng spec", weight: "45%", criteria: "Có test, có demo và đáp ứng ràng buộc thiết kế" },
  { item: "Chất lượng thiết kế: design doc, threat model, sơ đồ, schema", weight: "15%", criteria: "Design doc đủ chi tiết, có alternatives kèm lý do chọn" },
  { item: "Báo cáo và demo live", weight: "10%", criteria: "Slide ngắn cộng demo 15 phút, trả lời được Q&A về bottleneck" },
  { item: "Vận hành sạch: cost, tag, tự stop EC2, không leak secret", weight: "5%", criteria: "Không có secret trong git history, EC2 ngoài giờ đã stop" },
];

export const bonusItems = [
  "Triển khai infra-as-code bằng Terraform hoặc CloudFormation thay vì click console.",
  "Có observability stack tự host với Prometheus và Grafana, dashboard live.",
  "Có chaos test: kill 1 service ngẫu nhiên trong demo, hệ thống vẫn lên.",
];

export const generalNotes = [
  {
    label: "Khó nhưng có lý do",
    text: "Mọi ràng buộc về latency, throughput và privacy đều mô phỏng tình huống production. Nếu thấy ràng buộc nào không khả thi, hãy đề xuất relax trong design doc và bảo vệ.",
  },
  {
    label: "Đừng giấu rủi ro",
    text: "Nếu một tính năng có giả định mạnh, hãy ghi rõ trong README. Giảng viên đánh giá cao sự thành thật về giới hạn.",
  },
  {
    label: "Hỏi sớm, hỏi nhiều",
    text: "Mỗi tuần có 1 slot 30 phút Q&A với giảng viên. Nhóm nào không tận dụng sẽ bị đánh giá thấp về kỷ luật làm việc.",
  },
];

export const sections = [
  { id: "tong-quan", label: "Tổng quan", kind: "overview" },
  { id: "ci-cd", label: "CI/CD chung", kind: "cicd" },
  { id: "cloud", label: "Cloud được cấp", kind: "cloud" },
  ...groups.map((group) => ({ id: group.id, label: `Nhóm ${group.number}`, kind: "group", groupId: group.id })),
  { id: "nop-bai", label: "Nộp bài & chấm", kind: "submission" },
];
