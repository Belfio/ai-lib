import Search from "@/components/Search";
import EmailPreview from "@/components/EmailPreview";

export default function Dashboard() {
  return (
    <div className="justify-start items-center w-full h-full p-6 flex flex-col gap-6">
      <h1 className="text-4xl font-bold items-end pt-32">
        Welcome to the dashboard
      </h1>
      <Search className="w-[400px]" />
      <div className="flex flex-col gap-2 justify-start items-start w-full ">
        <p className="text-sm text-gray-500 font-light">Recent emails</p>
        <div className="flex flex-col gap-2 p-4 border rounded-lg w-full">
          <EmailPreview
            date="20/01/2024"
            sender="OpenAI"
            email="sam@openai.com"
            status="processing"
            subject="Subject"
            content="Dear valued partner, I hope this email finds you well. I wanted to personally reach out regarding our latest AI model developments. We've made significant breakthroughs in multimodal learning that I believe could revolutionize how we approach machine learning.We're seeing promising results in..."
          />
          <EmailPreview
            date="19/01/2024"
            sender="DeepMind"
            email="research@deepmind.com"
            status="sent"
            subject="Research Collaboration Opportunity"
            content="Hello, We've reviewed your recent work in reinforcement learning and are impressed with your novel approach to multi-agent systems. We would like to explore potential collaboration opportunities with your team. Our latest research initiatives align closely with..."
          />
          <EmailPreview
            date="18/01/2024"
            sender="Anthropic"
            email="partnerships@anthropic.com"
            status="draft"
            subject="Partnership Proposal"
            content="Greetings, Following our discussion at the AI Safety Conference last month, we've put together a detailed proposal for a potential partnership between our organizations. The proposal outlines how we can work together to advance responsible AI development..."
          />
          <EmailPreview
            date="18/01/2024"
            sender="Anthropic"
            email="partnerships@anthropic.com"
            status="draft"
            subject="Partnership Proposal"
            content="Greetings, Following our discussion at the AI Safety Conference last month, we've put together a detailed proposal for a potential partnership between our organizations. The proposal outlines how we can work together to advance responsible AI development..."
          />
          <EmailPreview
            date="18/01/2024"
            sender="Anthropic"
            email="partnerships@anthropic.com"
            status="draft"
            subject="Partnership Proposal"
            content="Greetings, Following our discussion at the AI Safety Conference last month, we've put together a detailed proposal for a potential partnership between our organizations. The proposal outlines how we can work together to advance responsible AI development..."
          />
          <EmailPreview
            date="18/01/2024"
            sender="Anthropic"
            email="partnerships@anthropic.com"
            status="draft"
            subject="Partnership Proposal"
            content="Greetings, Following our discussion at the AI Safety Conference last month, we've put together a detailed proposal for a potential partnership between our organizations. The proposal outlines how we can work together to advance responsible AI development..."
          />
        </div>
      </div>
    </div>
  );
}
