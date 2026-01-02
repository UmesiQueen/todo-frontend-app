import {
  EllipsisVerticalIcon,
  DotIcon,
  CircleDashedIcon,
  CircleIcon,
  CircleCheckBigIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import { ModeToggle } from "@/components/toggle-theme";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type Task = {
  task_id: number;
  title: string;
  project_title: string;
  priority_level: "low" | "medium" | "high";
  status: "to-do" | "in-progress" | "done";
  created_at: Date;
  updated_at?: Date;
};

const tasks: Task[] = [
  {
    task_id: 1,
    title: "Implement user authentication system",
    project_title: "SPR-1053",
    priority_level: "high",
    status: "in-progress",
    created_at: new Date("2026-01-02T14:23:47"),
  },
  {
    task_id: 2,
    title: "Design dashboard UI mockups",
    project_title: "SPR-1053",
    priority_level: "medium",
    status: "done",
    created_at: new Date("2026-01-02T14:23:47"),
  },
  {
    task_id: 3,
    title: "Update documentation for new features",
    project_title: "SPR-1053",
    priority_level: "low",
    status: "to-do",
    created_at: new Date("2026-01-02T14:23:47"),
    updated_at: new Date(),
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <header>
        <nav className="flex justify-between items-center gap-5 px-2 h-20 max-w-370 mx-auto">
          <h1 className="text-3xl font-bold text-sage">Sprint DashBoard</h1>
          <ModeToggle />
        </nav>
      </header>
      <main className="px-5 max-w-250 mx-auto">
        <div className="space-y-5">
          {/* Create */}
          <Button className="flex gap-2 items-center bg-sage hover:bg-sage/90 cursor-pointer ml-auto">
            <PlusIcon />
            Create
          </Button>

          <div className="flex gap-x-8 items-center h-10">
            {/* Search Bar*/}
            <div className="h-10 w-85 bg-white p-3 border border-sage font-sans rounded-lg font-normal text-sm flex items-center gap-2">
              <SearchIcon size={18} color="#5A7863" />
              <input
                type="text"
                className="bg-transparent w-full focus:outline-none py-1"
                placeholder="Search by title..."
              />
              <span className="sr-only">Search bar</span>
            </div>
            <Separator orientation="vertical" className="h-6! bg-sage" />
            {/* Filter */}
            <div className="flex items-center w-fit border border-sage font-medium rounded-lg bg-sage">
              <span className="px-3 text-[13px] font-semibold h-full text-white">
                {/* <ListFilterIcon size={15} /> */}
                Filter by Status
              </span>
              <Select>
                <SelectTrigger className="w-36 grow rounded-none rounded-r-lg border-0 border-l border-sage px-5 focus:ring-0 focus:ring-offset-0 bg-white">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="font-sans">
                  <SelectItem value="#">All</SelectItem>
                  <SelectItem value="to-do">To-do</SelectItem>
                  <SelectItem value="in-progress">In-Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Tasks */}
          <div className="my-10 flex flex-col gap-3">
            {tasks.map((task) => (
              <TaskCard key={task.task_id} {...task} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function TaskCard({ title, project_title, priority_level, status }: Task) {
  return (
    <div className="bg-pale-green/80 shadow-md rounded-lg p-6 w-full relative space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-sage">{title}</h3>
        <p className="text-sm inline-flex items-center">
          <span className="uppercase">{project_title}</span>{" "}
          <DotIcon size={20} /> Created 2 mins ago
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            aria-label="Open menu"
            size="icon-sm"
            className="absolute top-3 right-3"
          >
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="font-sans">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex items-center  border-2  rounded-lg w-fit pl-1 pr-2 h-8",
            {
              "text-red-800 bg-red-300/70 border-red-800":
                priority_level == "high",
              "text-green-800 bg-green-300/70 border-green-800":
                priority_level == "low",
              "text-orange-800 bg-orange-300/70 border-orange-800":
                priority_level == "medium",
            }
          )}
        >
          <DotIcon size={16} strokeWidth={3} absoluteStrokeWidth />
          <p className="text-xs font-medium capitalize leading-none">
            {priority_level}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-1 text-blue-700 bg-blue-300/50 border-2 border-blue-700 rounded-lg w-fit px-2 h-8",
            {
              "text-zinc-600 bg-zinc-300/50 border-zinc-600 ": status == "done",
              "text-blue-700 bg-blue-300/50 border-blue-700":
                status == "in-progress",
              "text-yellow-500 bg-yellow-300/50 border-yellow-500":
                status == "to-do",
            }
          )}
        >
          {status == "done" ? (
            <CircleCheckBigIcon size={15} className="text-green-700" />
          ) : status == "to-do" ? (
            <CircleIcon size={15} />
          ) : status == "in-progress" ? (
            <CircleDashedIcon size={15} />
          ) : (
            ""
          )}
          <p className="text-xs font-medium capitalize leading-none">
            {status}
          </p>
        </div>
      </div>
    </div>
  );
}
