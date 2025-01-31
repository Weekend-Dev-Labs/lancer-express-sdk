import e from 'express'
type AuthHandler = ({
    token,
    session,
}: {
    token: string
    session: lancerTypes.SessionRequest
}) => Promise<{ ownerId: string; status: number }>

function lancer({ signingSecret }: { signingSecret: string }) {
    function auth(handler: AuthHandler) {
        return async (
            req: e.Request,
            res: e.Response,
            next: e.NextFunction,
        ) => {
            const authHeader = req.headers?.authorization?.split(' ')[1]

            if (!authHeader) {
                return res.status(403).send()
            }
            const body = req.body as lancerTypes.SessionRequest
            if (
                body.chunk_size &&
                body.file_name &&
                body.file_size &&
                body.max_chunk &&
                body.max_chunk &&
                body.mime_type &&
                body.provider
            ) {
                const ack = await handler({ token: authHeader, session: body })
                return res.status(ack.status).send({ ownerId: ack.ownerId })
            } else {
                return res.status(422).send()
            }
        }
    }

    function webhook() {
        return (req: e.Request, res: e.Response, next: e.NextFunction) => {}
    }

    return {
        auth,
        webhook,
    }
}
