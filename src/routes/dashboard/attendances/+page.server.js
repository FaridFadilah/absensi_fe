import { redirect } from "@sveltejs/kit"
import { Attendances } from "../../../models/attendances"
import { me } from "../../../models/users"

async function load({ cookies }) {
    const user = await me(cookies)

    if (!user.token) {
        throw redirect(302, "/auth/login")
    }

    let search = null
    if(user.jabatan !== "Admin"){
        search = user.name
    }

    const attendances = new Attendances(user.token)
    const data = await attendances.index(search)

    return {
        attendances: data
    }
}

let actions = {
    delete: async ({ request, cookies }) => {
        const user = await me(cookies)

        if (!user.token) {
            throw redirect(302, "/auth/login")
        }

        const form = await request.formData()
        const id = form.get('id')

        const attendances = new Attendances(user.token)
        const result = await attendances.destroy(id)

        if (result.error) {
            cookies.set("message", result.error, { path: "/", maxAge: 3.5 });
            cookies.set("type", "error", { path: "/", maxAge: 3.5 });
        } else {
            cookies.set("message", "Data berhasil dihapus", { path: "/", maxAge: 3.5 });
            cookies.set("type", "success", { path: "/", maxAge: 3.5 });
        }

        return redirect(302, "/dashboard/attendances")
    }
}

export { load, actions }