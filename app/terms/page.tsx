import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link href="/register" className="inline-flex items-center text-primary-600 mb-6 hover:underline">
          <FaArrowLeft className="mr-2" /> 返回注册
        </Link>
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-3xl font-bold mb-6">用户协议</h1>
          <div className="prose prose-gray max-w-none">
            <p>欢迎使用“东源E栖谷”平台。本协议是您与本平台之间关于使用服务所订立的协议。</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">一、账号注册</h2>
            <p>您在使用本服务前需要注册一个账号。账号应当使用手机号码或邮箱绑定，请您使用尚未被平台绑定的手机号码或邮箱注册。平台可以根据用户需求或产品需要对账号注册方式进行变更。</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">二、用户行为</h2>
            <p>您在使用本服务时，必须遵守中华人民共和国相关法律法规，不得利用本服务从事违法违规行为，包括但不限于：发布违法信息、侵犯他人知识产权、进行商业广告等。</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">三、积分与权益</h2>
            <p>积分是平台内用于衡量用户贡献的虚拟单位，可通过参与活动、发布话题、完成项目等方式获取。积分可用于兑换平台内的产品、服务或权益，具体兑换规则以积分商城页面为准。平台有权根据运营情况调整积分获取和兑换规则。</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">四、责任声明</h2>
            <p>您理解并同意，平台将尽力确保服务的稳定和安全，但对于不可抗力、第三方服务故障等原因导致的服务中断或数据丢失，平台不承担责任。</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">五、协议修改</h2>
            <p>平台有权根据法律法规变化和运营需要修改本协议，修改后的协议将在平台公布。如您继续使用服务，即视为同意修改后的协议。</p>
            
            <p className="mt-8 text-sm text-gray-500">最后更新：2026年3月15日</p>
          </div>
        </div>
      </div>
    </div>
  );
}