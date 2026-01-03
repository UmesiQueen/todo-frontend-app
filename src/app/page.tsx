"use client";

import * as React from "react";
import {
  EllipsisVerticalIcon,
  DotIcon,
  CircleDashedIcon,
  CircleIcon,
  CircleCheckBigIcon,
  PlusIcon,
  SearchIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { ModeToggle } from "@/components/toggle-theme";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { formatDistanceStrict } from "date-fns";

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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";

type TaskFormInput = {
  title: string;
  project_name: string;
  priority_level: "low" | "medium" | "high";
  status: "to-do" | "in-progress" | "done";
};

type Task = TaskFormInput & {
  task_id: string;
  created_at: Date;
  updated_at?: Date;
};

export default function Home() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("#");
  const [filteredTasks, setFilteredTasks] = React.useState<Task[]>(tasks);

  React.useEffect(() => {
    setTasks(JSON.parse(localStorage.getItem("tasks") ?? "[]"));
  }, []);

  React.useEffect(() => {
    if (tasks.length > 0) localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Debounced filter effect
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      let filtered = tasks;

      // search filter
      if (searchQuery) {
        filtered = tasks.filter((task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // status filter
      if (statusFilter !== "#") {
        filtered = filtered.filter((task) => task.status === statusFilter);
      }

      setFilteredTasks(filtered);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, statusFilter, tasks]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TaskFormInput>();

  const onSubmit: SubmitHandler<TaskFormInput> = (data) => {
    setLoading(true);
    if (editingTask) {
      const updatedTask: Task = {
        ...editingTask,
        ...data,
        updated_at: new Date(),
      };

      setTimeout(() => {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.task_id === editingTask.task_id ? updatedTask : task
          )
        );
        setIsDialogOpen(false);
        setLoading(false);
        reset();

        toast.success("Task updated successfully");
      }, 700);
    } else {
      const newTask: Task = {
        task_id: `tk_${uuidv4().slice(0, 5)}`,
        created_at: new Date(),
        ...data,
      };

      setTimeout(() => {
        setTasks((prev) => [...prev, newTask]);
        setIsDialogOpen(false);
        setLoading(false);
        reset();

        toast.success("New task created successfully");
      }, 700);
    }
  };

  const handleDelete = async (taskId: string) => {
    const deleteTask = async () => {
      await new Promise((resolve) => setTimeout(resolve, 700));

      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.filter(
          (task) => task.task_id !== taskId
        );
        localStorage.setItem("tasks", JSON.stringify(updatedTasks));
        return updatedTasks;
      });

      return { message: "Task has been deleted!" };
    };

    toast.promise(deleteTask(), {
      loading: "Deleting...",
      success: (data) => `${data.message}`,
      error: "Error occurred",
    });
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setValue("title", task.title);
    setValue("project_name", task.project_name);
    setValue("priority_level", task.priority_level);
    setValue("status", task.status);
    setIsDialogOpen(true);
  };

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
          <Dialog
            open={isDialogOpen}
            onOpenChange={(state) => {
              setIsDialogOpen(state);
              if (!state) {
                setTimeout(() => {
                  setEditingTask(null);
                  reset();
                }, 0);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                className="flex gap-2 items-center cursor-pointer ml-auto"
                onClick={() => {
                  setEditingTask(null);
                  reset();
                }}
              >
                <PlusIcon />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-106.25 font-sans">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <DialogHeader>
                  <DialogTitle className="text-sage font-bold">
                    {editingTask ? "Edit Task" : "Create New Task"}
                  </DialogTitle>
                  <DialogDescription className="hidden">
                    Make changes to your profile here. Click save when
                    you&apos;re done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 [&_label]:text-sage ">
                  <div className="grid gap-3">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Task title..."
                      maxLength={120}
                      {...register("title", {
                        required: "This field is required",
                        max: {
                          value: 120,
                          message: "200 maximum chars exceeded",
                        },
                      })}
                    />
                    {errors.title && (
                      <p className="text-xs text-red-500 -mt-1">
                        {errors.title.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="project_name">Project Name</Label>
                    <Input
                      id="project_name"
                      placeholder="eg. TalkSign"
                      maxLength={40}
                      {...register("project_name", {
                        required: "This field is required",
                        max: 40,
                      })}
                    />
                    {errors.project_name && (
                      <p className="text-xs text-red-500 -mt-1">
                        {errors.project_name.message}
                      </p>
                    )}
                  </div>
                  <div className="md:flex gap-3">
                    {/* Priority Level */}
                    <div className="grid gap-3">
                      <Label htmlFor="priority_level">Priority Level</Label>
                      <Controller
                        name="priority_level"
                        control={control}
                        rules={{ required: "This field is required" }}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger id="priority_level" className="w-45">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent className="font-sans">
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.priority_level && (
                        <p className="text-xs text-red-500 -mt-1">
                          {errors.priority_level.message}
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="grid gap-3">
                      <Label htmlFor="status">Status</Label>
                      <Controller
                        name="status"
                        control={control}
                        rules={{ required: "This field is required" }}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger id="status" className="w-45">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent className="font-sans">
                              <SelectItem value="to-do">To-Do</SelectItem>
                              <SelectItem value="in-progress">
                                In-Progress
                              </SelectItem>
                              <SelectItem value="done">Done</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.status && (
                        <p className="text-xs text-red-500 -mt-1">
                          {errors.status.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={loading} className="w-20">
                    {loading ? (
                      <LoaderCircleIcon className="animate-spin" />
                    ) : (
                      <span>{editingTask ? "Update" : "Add new"}</span>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <div className="flex gap-x-8 items-center h-10">
            {/* Search Bar*/}
            <div className="h-10 w-85 bg-white p-3 border border-sage font-sans rounded-lg font-normal text-sm flex items-center gap-2">
              <SearchIcon size={18} color="#5A7863" />
              <input
                type="text"
                className="bg-transparent w-full focus:outline-none py-1"
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="sr-only">Search bar</span>
            </div>
            <Separator orientation="vertical" className="h-6! bg-sage" />
            {/* Filter */}
            <div className="flex items-center w-fit border border-sage font-medium rounded-lg bg-sage">
              <span className="px-3 text-[13px] font-semibold h-full text-white">
                Filter by Status
              </span>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                }}
              >
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
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.task_id}
                  {...task}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                {searchQuery
                  ? "No tasks found matching your search"
                  : "No tasks yet"}
              </div>
            )}
          </div>
        </div>
        <Toaster />
      </main>
    </div>
  );
}

interface TaskCardProp extends Task {
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
}
function TaskCard(props: TaskCardProp) {
  const {
    task_id,
    title,
    project_name,
    priority_level,
    status,
    created_at,
    onDelete,
    onEdit,
  } = props;

  return (
    <div className="bg-pale-green/80 shadow-md rounded-lg p-6 w-full relative space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-sage">{title}</h3>
        <p className="text-sm inline-flex items-center">
          <span className="uppercase">{project_name}</span>
          <DotIcon size={20} />
          <span>
            {props?.updated_at ? "Updated" : "Created"}{" "}
            {formatDistanceStrict(
              new Date(props?.updated_at ?? created_at),
              new Date(),
              {
                addSuffix: true,
              }
            )}
          </span>
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
          <DropdownMenuItem onClick={() => onEdit(props)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(task_id)}
            className="text-red-500"
          >
            Delete
          </DropdownMenuItem>
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
