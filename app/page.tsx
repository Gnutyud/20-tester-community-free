"use client";
import GroupCard from "@/components/group-card";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import toast from "react-hot-toast";

export default function Home() {
  const notify = () => toast("Here is your toast.");
  return (
    <main>
      <Container>
        <section className="grid grid-cols-4 gap-8 py-4">
          <div className="col-span-3">
            <div className="grid grid-cols-1 gap-4">
              <GroupCard title="Group 1" description="Test my app" href="#" />
              <GroupCard title="Group 2" description="Test my app" href="#" />
              <GroupCard title="Group 3" description="Test my app" href="#" />
              <GroupCard title="Group 4" description="Test my app" href="#" />
            </div>
          </div>
          <Sidebar />
        </section>
      </Container>
    </main>
  );
}
