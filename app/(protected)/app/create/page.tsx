"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createNewApp } from "@/actions/create-new-app";
import { FormError } from "@/components/form-error";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NewAppSchema } from "@/schemas";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

function AppCreate() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const router = useRouter();

  const form = useForm<z.infer<typeof NewAppSchema>>({
    resolver: zodResolver(NewAppSchema),
    defaultValues: {
      appName: "",
      packageName: "",
      installUrl: "",
      googleGroupUrl: "",
      targetTesterCount: 14,
    },
  });

  const onSubmit = (values: z.infer<typeof NewAppSchema>) => {
    console.log(values);
    startTransition(() => {
      createNewApp(values)
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
        <h1 className="text-2xl font-semibold mb-8">Add your app to test</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="appName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>App name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your app name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="packageName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package name</FormLabel>
                  <FormControl>
                    <Input placeholder="example: com.20testercommunity.myapp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="installUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>App install url</FormLabel>
                  <FormControl>
                    <Input placeholder="Web install or App install url" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="googleGroupUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Group</FormLabel>
                  <FormControl>
                    <Input placeholder="Please fill your Google Groups url here" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetTesterCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How many testers do you need?</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={4}
                      max={50}
                      placeholder="Example: 14"
                      {...field}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormError message={error} />
            <Button type="submit">Add</Button>
          </form>
        </Form>
      </div>
    </Container>
  );
}

export default AppCreate;
