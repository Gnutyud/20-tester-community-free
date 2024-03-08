"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createNewGroup } from "@/actions/create-new-group";
import { FormError } from "@/components/form-error";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NewGroupSchema } from "@/schemas";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

function NewGroup() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const router = useRouter();
  const [apps, setApps] = useState<any[]>([]);

  useEffect(() => {
    const fetchGroupData = async () => {
      const data = await fetch("/api/app");
      const response = await data.json();
      setApps(response);
    };
    fetchGroupData();
  }, []);

  const form = useForm<z.infer<typeof NewGroupSchema>>({
    resolver: zodResolver(NewGroupSchema),
    defaultValues: {
      maxMembers: 20,
    },
  });

  const onSubmit = (values: z.infer<typeof NewGroupSchema>) => {
    console.log(values);
    startTransition(() => {
      createNewGroup(values)
        .then((data) => {
          if (data?.error) {
            form.reset();
            setError(data.error);
          }

          if (data?.success) {
            form.reset();
            router.push("/");
          }
        })
        .catch(() => setError("Something went wrong"));
    });
  };

  return (
    <Container>
      <div className="my-8">
        <h1 className="text-2xl font-semibold mb-8">Create a new group</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="maxMembers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Members</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value.toString()} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a verified email to display" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="appId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your app</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value?.toString()} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your app to join this group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {apps.map((app) => (
                        <SelectItem key={app.id} value={app.id.toString()}>
                          {app.appName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormError message={error} />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    </Container>
  );
}

export default NewGroup;
