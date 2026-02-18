import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ReconciliationTable from "@/components/ReconciliationTable";

const Index = () => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <ReconciliationTable />
        </main>
      </div>
    </div>
  );
};

export default Index;
