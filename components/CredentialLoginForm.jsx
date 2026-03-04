import { loginAction } from "@/lib/actions/student.action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CredentialLoginForm() {
  return (
    <form action={loginAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="guest@university.edu"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="123456"
          required
        />
      </div>
      <Button type="submit" className="w-full">
        Login
      </Button>
    </form>
  )
}
