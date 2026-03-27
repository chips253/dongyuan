import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link href="/register" className="inline-flex items-center text-primary-600 mb-6 hover:underline">
          <FaArrowLeft className="mr-2" /> 返回注册
        </Link>
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-3xl font-bold mb-6">隐私政策</h1>
          <div className="prose prose-gray max-w-none">
            <p>本隐私政策旨在说明“东源E栖谷”如何收集、使用、存储和保护您的个人信息。</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">一、信息收集</h2>
            <p>我们收集的信息包括您注册时提供的姓名、邮箱、手机号码，以及您在使用服务过程中产生的活动记录、积分记录等。此外，为提升服务体验，我们可能会收集您的设备信息、日志信息等。</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">二、信息使用</h2>
            <p>您的信息将用于：提供和改善服务、发送通知、进行用户画像分析以优化推荐内容。我们不会将您的个人信息出售给第三方。</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">三、信息保护</h2>
            <p>我们采取行业标准的安全措施保护您的信息，包括加密存储、访问控制等。但请注意，互联网传输无法保证绝对安全。</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">四、您的权利</h2>
            <p>您可以随时访问个人中心查看、修改您的个人信息，或联系管理员删除账号。</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">五、政策更新</h2>
            <p>我们可能会不时更新本隐私政策，更新后将在平台公布。如您继续使用服务，即视为同意更新后的政策。</p>
            
            <p className="mt-8 text-sm text-gray-500">最后更新：2026年3月15日</p>
          </div>
        </div>
      </div>
    </div>
  );
}