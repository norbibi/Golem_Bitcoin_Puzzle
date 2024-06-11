import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/Container';
import { Copy } from 'react-bootstrap-icons';
import Button from 'react-bootstrap/Button';

export function setMessage(setShowMessage, setVariantMessage, setHeadingMessage, setContentMessage, variant, head, content) {
    setShowMessage(true);
    setVariantMessage(variant);
    setHeadingMessage(head);
    setContentMessage(content);
    window.scrollTo(0, 0);
}

export const Message = (data) => {
    return (
        <Container className="mt-4 px-0">
            {data.show && (
                <Alert className="pb-3 prevent-select"
                    variant={data.variant}
                    onClose={() => data.setShowMessage(false)}
                    dismissible>
                    <Alert.Heading className="text-center">{data.heading}</Alert.Heading>
                    <div className="mt-3 text-center">
                        { data.content && (
                            data.content.map((line, index) => (
                                <p key={`${index}`} className="mb-1">{line}
                                { (index == 1) && (data.heading == "Found") &&
                                    <Button variant="secondary" className="mx-2 px-1 py-0" onClick={() => navigator.clipboard.writeText(line.trim().split(' ')[2])}>
                                    <Copy className="vatt"/>
                                    </Button>
                                }
                                </p>
                            ))
                        )}
                    </div>
                </Alert>
            )}
        </Container>
    )
}