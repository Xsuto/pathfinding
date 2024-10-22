import type { DialogTriggerProps } from "@kobalte/core/dialog";
import { BiRegularSave } from "solid-icons/bi";
import { createSignal } from "solid-js";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export function SaveBoardDialog({
  onSaveBoard,
}: { onSaveBoard: (title: string) => void }) {
  const [title, setTitle] = createSignal("");
  const [dialogOpen, setDialogOpen] = createSignal(false);

  return (
    <Dialog open={dialogOpen()} onOpenChange={setDialogOpen}>
      <DialogTrigger
        as={(props: DialogTriggerProps) => (
          <Button variant="outline" class="space-x-2" {...props}>
            <BiRegularSave />
            <span class="hidden md:block">Save</span>
          </Button>
        )}
      />
      <DialogContent class="sm:max-w-[425px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSaveBoard(title());
            setTitle("");
            setDialogOpen(false);
          }}
        >
          <DialogHeader>
            <DialogTitle>Save board</DialogTitle>
          </DialogHeader>
          <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
              <label for="title" class="text-right">
                Title
              </label>
              <input
                id="title"
                class="col-span-3 border rounded-md p-1 pl-2"
                onChange={(e) => setTitle(e.target.value)}
                value={title()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
